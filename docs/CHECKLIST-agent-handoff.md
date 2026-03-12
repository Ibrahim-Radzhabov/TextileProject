# Чек-лист для коллеги-агента (handoff)

**Цель:** следующий агент видит, что уже сделано и что делать дальше.  
**Дата handoff:** 2026-03 (сессия: UI sidebar, SEO/инфра, документация для агентов).

---

## Выполнено в этой сессии

### UI: сайдбар и навигация

- [x] **Off-canvas сайдбар (SidebarMenu)**
  - Компонент `apps/web/app/(components)/sidebar-menu.tsx`: левая панель, выезжает по клику, overlay, блокировка скролла body.
  - Кнопка-триггер: бургер + «Menu» / при открытом меню — «Close» + стрелка; позиция — **слева, на одной высоте с док-станцией** (`fixed left-4 top-24`, `md:left-10 md:top-24`).
  - Внутри: вертикальный список (SALES, WOMAN, MAN, COLLECTIONS, ABOUT AGNONA) с шевроном справа; ссылки ведут на `/catalog?segment=...` и `/about`.
  - Подключён в `storefront-shell.tsx` глобально (`<SidebarMenu />` перед `AnnouncementTicker`).

- [x] **HeaderDropdownMenu: режимы (пилюли)**
  - В `header-dropdown-menu.tsx`: типы `HeaderDropdownMode`, пропсы `modes`, `initialModeId`, `onModeChange`.
  - Горизонтальный скроллируемый список кнопок-режимов (Шторы, Тюль, Комплекты, Пошив на заказ) с активным состоянием и опциональными иконкой/бейджем.
  - В `storefront-shell.tsx`: на главной (`pathname === "/"`) передаются `dropdownModes`, при выборе режима — переход на `/catalog?segment=...` через `handleDropdownModeChange`.
  - Режимы показываются и на десктопе (в rightSlot), и на мобилке.

### Документация для агентов

- [x] **Безопасность**
  - `docs/AGENTS-security-guide.md`: секреты, админ-токен, CORS, логирование, бэкапы SQLite, чек-лист до/после изменений.

- [x] **Кэширование и edge**
  - `docs/AGENTS-caching-and-edge.md`: что кэшировать (статику / HTML / API), правила Next.js (dynamic, revalidate), пример Nginx с кэшем и rate-limit, internal-кэш, чек-лист.

### Обсуждено (решений в коде нет, только рекомендации)

- SEO: уже реализован (metadata, sitemap, robots, JSON-LD); до заполнения контентом дорабатывать не обязательно.
- БД: используется SQLite (`OrderStore`, `orders.sqlite3`); миграция на Postgres — по мере роста нагрузки/требований.
- Сервер: стартовый прод — 2 vCPU, 4 ГБ RAM; при росте — 4 vCPU, 8 ГБ.
- Аналитика: «онлайн за сегодня» / уникальные пользователи сейчас не считаются; предложено подключить внешнюю аналитику (Plausible/Umami) или позже добавить свой сбор сессий.

---

## Что предстоит следующему агенту

- [ ] **Проверить UI в браузере**
  - Убедиться, что кнопка «Menu» слева видна и сайдбар открывается/закрывается; при необходимости подправить `top-24` под реальную высоту шапки.
  - Проверить HeaderDropdownMenu с режимами на главной (десктоп и мобилка).

- [ ] **Безопасность и кэш (по запросу пользователя)**
  - Следовать `AGENTS-security-guide.md`: сменить дефолтный `ADMIN_TOKEN`, проверить CORS, не логировать секреты.
  - По необходимости внедрить конфиг из `AGENTS-caching-and-edge.md` (Nginx/Cloudflare) на проде.

- [ ] **Отчёты и метрики**
  - При появлении трафика — заполнять шаблоны из `docs/report-*.md` по гайду `docs/AGENTS-reporting-guide.md`.
  - Если нужна своя аналитика «онлайн / уникальные» — спроектировать endpoint и таблицу сессий (см. обсуждение выше).

- [ ] **Прочее**
  - При добавлении новых фич — обновлять этот чек-лист или создавать `CHECKLIST-<тема>.md` по аналогии с `CHECKLIST-header-dock-hero.md`.

---

## Связанные файлы

| Назначение | Путь |
|------------|------|
| Сайдбар (off-canvas) | `apps/web/app/(components)/sidebar-menu.tsx` |
| Подключение сайдбара | `apps/web/app/storefront-shell.tsx` |
| Меню с режимами (пилюли) | `apps/web/app/(components)/header-dropdown-menu.tsx` |
| Гайд по безопасности | `docs/AGENTS-security-guide.md` |
| Гайд по кэшу и edge | `docs/AGENTS-caching-and-edge.md` |
| Гайд по отчётам | `docs/AGENTS-reporting-guide.md` |
| Чек-лист шапка/hero/док | `docs/CHECKLIST-header-dock-hero.md` |
