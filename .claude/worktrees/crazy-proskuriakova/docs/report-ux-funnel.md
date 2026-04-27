## UX Funnel Report (Storefront)

**Scope:** Home → Catalog → PDP → Cart → Checkout (demo client `CLIENT_ID=demo`).

---

### 1. Summary

- **Objective:** Коротко, зачем делаем отчёт и какую гипотезу проверяем (например: «понизить отвал между PDP и корзиной»).
- **Timeframe:** Диапазон дат и релиз/ветка, к которому относится анализ.
- **Traffic sample:** Объём сессий/пользователей, источники трафика, важные фич‑флаги.
- **Key result:** В 1–2 предложениях: где основной просад и какой шаг бьёт по конверсии сильнее всего.

---

### 2. Funnel Definition

- **Entry point(s):**
  - `/` (hero + быстрые входы),
  - прямой вход в `/catalog`,
  - вход из внешних кампаний на PDP.
- **Steps (example):**
  1. Home viewed (H1 + hero видны, без ошибок).
  2. Catalog viewed (виден заголовок «Каталог», фильтры прогружены).
  3. PDP viewed (основной H1 + галерея товара).
  4. Add to cart clicked (основная CTA на PDP).
  5. Checkout started (`/checkout` открыт без ошибок).
  6. Order confirmed (`/checkout/success` с валидным `order_id`).
- **Segment definitions:**
  - device: desktop / mobile (breakpoints 390 / 768 / 1280),
  - traffic: organic / paid / direct (если есть),
  - new vs returning (по cookie/anon‑id).

---

### 3. Quantitative Funnel (Per Segment)

> Данные заполняет агент/аналитик из BI/метрик.

Для каждого шага:

- **Visitors / sessions:** `N`.
- **Step conversion:** `step_conv = step_N / previous_step_N`.
- **Cumulative conversion:** `cum_conv = step_N / first_step_N`.
- **Median time to next step.**

Рекомендуется оформить как таблицу:

| Step | Description | N | Step conv | Cum conv | Median time → next |
| ---- | ----------- | - | --------- | -------- | ------------------- |
| 1    | Home viewed |   |           |          |                     |
| 2    | Catalog     |   |           |          |                     |
| …    |             |   |           |          |                     |

Для каждого важного сегмента (desktop / mobile) отдельная таблица или подсекция.

---

### 4. Key Drop-offs & Patterns

- **Top 2–3 drop-offs:** Где самое сильное падение конверсии (например, Catalog → PDP, PDP → Add to cart).
- **Behavioral patterns:**
  - частота использования фильтров/поиска (`CatalogNeonFilter`, mini‑rail),
  - клики по избранному и переходы в `/favorites`,
  - возвраты назад из Checkout.
- **Cross‑device differences:** Чем отличаются воронки desktop vs mobile (например, выше отвал на мобильном при переходе к Checkout).

---

### 5. UX Issues & Hypotheses

Свяжите количественный провал с конкретными местами UI:

- **Navigation / header:** Док, поиск, мобильное меню, bottom‑nav — есть ли фрикции.
- **Hero + quick‑links:** Понимают ли пользователи, куда ведут быстрые входы.
- **Catalog:** фильтры, сортировка, читаемость карточек, пустые состояния.
- **PDP:** видимость цены, CTA, избранное, swatches/услуги.
- **Checkout:** длина формы, ошибки валидации, отсутствие подсказок.

Для каждой проблемы — короткая гипотеза:

- *Example:* «Высокий отвал Catalog → PDP на mobile из‑за того, что карточки требуют скролла, а CTA/цена неочевидны».

---

### 6. Recommendations (Prioritized)

Сделайте короткий список действий, ранжированный по влиянию и сложности:

- **P0 (must‑do):**
  - … (изменения, которые сразу бьют по большому провалу).
- **P1 (next):**
  - … (улучшения, требующие небольшой разработки/дизайна).
- **P2 (experiments / A/B):**
  - … (гипотезы, которые лучше проверять через эксперимент).

Для каждого пункта добавьте:

- затронутые маршруты (`/`, `/catalog`, `/product/[slug]`, `/checkout`),
- ожидание по метрике (какой шаг воронки хотите улучшить и на сколько).

---

### 7. Checkpoints & Follow-up

- **Next measurement window:** когда переснимать воронку после правок.
- **Guardrails:**
  - какие E2E‑тесты/визуальные снапшоты уже покрывают изменения,
  - какие новые проверки добавить (например, дополнительные `@visual`‑снапшоты для нового состояния дока).
- **Owner / status:** кто отвечает за реализацию (human/agent), текущий статус (planning / in progress / validated).

