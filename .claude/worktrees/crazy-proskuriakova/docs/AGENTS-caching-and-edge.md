## Caching & Edge Guide for AI Agents (Storefront)

**Audience:** агенты, отвечающие за производительность, кэш и прокси.  
**Goal:** описать, где именно можно и нужно кэшировать, а где — нет, и как делать это безопасно.

---

### 1. High-Level Architecture

- **Frontend:** Next.js App Router (`apps/web`), SSR + немного статики.
- **Backend API:** FastAPI (`apps/api`), использует SQLite через `OrderStore`.
- **Static Assets:** `/_next/static/*`, `/icons/*`, изображения продукта, `manifest`, `sw.js`.

Кэш может быть на нескольких уровнях:

1. **Браузер / CDN (edge/прокси)** — самый дешёвый и приоритетный уровень.
2. **Next.js (ISR / revalidate / fetch‑cache)** — контроль кэша страниц/данных.
3. **API (reverse‑proxy +, при необходимости, Redis)**.

Агенты должны **начинать с внешнего кэша** и только потом усложнять внутренние слои.

---

### 2. What is Safe to Cache Aggressively

**Можно кэшировать долго (статическое):**

- `/_next/static/*`
- `/icons/*`
- `/fonts/*` (если появятся)
- `manifest.webmanifest`
- `sw.js`

Рекомендуемые заголовки:

- `Cache-Control: public, max-age=31536000, immutable`

**Можно кэшировать коротко/средне (HTML + JSON без персональных данных):**

- `GET /` (домашняя витрина, если контент не меняется каждую минуту),
- `GET /catalog` (каталог без персонализации),
- `GET /product/[slug]`,
- `GET /guides` и `GET /guides/[slug]`,
- `GET /api/catalog*` (если такой эндпоинт есть и не зависит от пользователя).

Рекомендуемые интервалы:

- `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
  - `s-maxage` — для CDN/прокси,
  - `stale-while-revalidate` — позволяет возвращать старую версию, пока идёт обновление.

**Нельзя кэшировать как есть (или нужно делать vary по пользователю):**

- Личные кабинеты, заказы, корзина, избранное, что угодно, зависящее от пользователя.
- Checkout (`/checkout`, `/api/checkout*`), вебхуки.

---

### 3. Next.js-Level Caching Rules

Файлы, важные для кэша:

- `apps/web/app/layout.tsx` — глобальные настройки (сейчас `dynamic = "force-dynamic"`).
- `apps/web/app/page.tsx` — главная.
- `apps/web/app/catalog/page.tsx`
- `apps/web/app/product/[slug]/page.tsx`
- `apps/web/lib/get-storefront-config.ts` — источник данных витрины.

**Текущая ситуация:**

- В `layout.tsx` выставлено `export const dynamic = "force-dynamic";` — это **отключает многие кэши App Router**.
  - Менять это поведение можно **только сознательно** и **с комментариями в документации**, т.к. это влияет на всё приложение.

**Если пользователь попросит оптимизировать скорость:**

1. Рассмотреть перевод конкретных страниц на ISR:
   - использовать `export const revalidate = <seconds>` в `page.tsx`,
   - либо настроить `fetch` с `next: { revalidate: X }` в `getStorefrontConfig`.
2. Никогда не включать ISR/кэш для страниц, где контент зависит от:
   - cookie пользователя,
   - query‑параметров с приватной информацией,
   - auth‑сессии.

При изменении `dynamic`/`revalidate` агент обязан:

- описать изменение в соответствующем отчёте (например, `report-storefront-kpi.md` или `frontend-audit-*.md`);
- указать, какие маршруты теперь кэшируются и с какими сроками.

---

### 4. Reverse Proxy / CDN Configuration (Nginx Example)

Ниже — **пример**, который агент может адаптировать и предложить пользователю.  
Самостоятельно править боевые конфиги без запроса пользователя **нельзя**.

```nginx
server {
    listen 80;
    server_name shop.example.com;

    # Статика Next.js и иконки
    location ~* ^/(_next/static|icons|manifest\.webmanifest|sw\.js) {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Кэшируем главную и каталог
    location ~* ^/(|catalog|guides(/.*)?)$ {
        proxy_cache my_cache;
        proxy_cache_valid 200 60s;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;

        proxy_pass http://127.0.0.1:3000;
    }

    # API без кэша (чувствительные и персональные данные)
    location ~* ^/(api|checkout|admin)/ {
        proxy_pass http://127.0.0.1:8000;
        # Здесь могут быть rate limit и auth
    }

    # Остальное — проксируем без кэша
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

**Задачи агента:**

- адаптировать список URL’ов под конкретный деплой (домены, пути),
- не кэшировать приватные роуты,
- добавить `X-Cache-Status` для отладки.

---

### 5. Rate Limiting Patterns (Proxy)

Пример для Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    ...

    location ~* ^/api/checkout {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000;
    }
}
```

Рекомендации:

- для checkout — ~5–10 запросов/сек на IP с небольшим `burst`,
- для `/admin` — более жёсткий лимит (например, 2–3 запроса/сек),
- для статики и SEO‑страниц лимиты обычно не нужны.

Агент должен:

- всегда документировать новые лимиты и их влияние,
- не включать агрессивный лимит без тестов (UI/тесты checkout не должны «стрелять» в лимит).

---

### 6. Internal Caching (API / OrderStore)

Сейчас `OrderStore` работает поверх SQLite **без отдельного кэша**.

**Что можно сделать, если появится нагрузка (только по запросу пользователя):**

- добавить кэш‑слой для «аналитических» запросов:
  - например, результаты `list_pwa_install_daily_summary` на короткое время,
  - использовать in‑memory кэш (LRU) или Redis.
- Сохранять инвариант:
  - запись (`INSERT/UPDATE`) всегда идёт в SQLite,
  - чтение может брать данные из кэша, если TTL не истёк.

При добавлении internal‑кэша:

- описать ключи, TTL и условия инвалидации в этом файле и/или отдельном отчёте,
- избегать кэширования запросов, которые используются для real‑time мониторинга инцидентов.

---

### 7. Checklist for Caching / Edge Changes

Перед изменениями:

- [ ] Понято, какие маршруты/эндпойнты затрагиваются.
- [ ] Проверено, что на этих маршрутах **нет приватного пользовательского контента**.
- [ ] Понятно, кто и где будет очищать кэш (TTL или ручной purge).

После изменений:

- [ ] Добавлены/обновлены заголовки `Cache-Control` и, при необходимости, `Vary`.
- [ ] Проверено поведение при обновлении контента (например, новый товар, изменение цены).
- [ ] Задокументировано поведение кэша в одном из отчётов (`frontend-audit-*.md`, `report-storefront-kpi.md`) или в этом файле.

Агенты должны стремиться к тому, чтобы **любой следующий агент мог понять, что и где кэшируется**, без чтения всего кода и конфигов.

