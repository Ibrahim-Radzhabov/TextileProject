## Storefront KPI Report

**Scope:** Бизнес‑метрики витрины за период (конверсия, средний чек, favorites, PWA, ретеншн).

---

### 1. Summary

- **Period:** даты отчёта (например, неделя/месяц).
- **Traffic / sessions:** сколько сессий/пользователей попало в выборку.
- **Top line KPIs:**
  - конверсия в заказ (sessions → orders),
  - средний чек (AOV),
  - доля заказов с мобильных устройств,
  - вовлечённость в favorites/PWA (если важно).
- **Narrative:** 3–5 предложений с основными выводами (рост/падение, ключевой драйвер, риски).

---

### 2. Core Commerce KPIs

- **Conversion funnel (high level):**

| Stage            | Metric                  | Value | Δ vs prev period |
| ---------------- | ----------------------- | ----- | ---------------- |
| Sessions         | sessions                |       |                  |
| Product views    | PDP views               |       |                  |
| Add to cart      | add‑to‑cart events     |       |                  |
| Checkout started | checkout sessions       |       |                  |
| Orders           | completed orders        |       |                  |

- **Order metrics:**
  - Orders count.
  - AOV (average order value).
  - Revenue proxies (если есть цены).
  - Split by device (desktop / mobile) и, при необходимости, канал.

---

### 3. Favorites & Engagement

Базируйтесь на favorites‑слое и метриках:

- **Favorites usage:**

| Metric                        | Value | Notes |
| ----------------------------- | ----- | ----- |
| Favorites events (add/remove) |       |       |
| Unique `sync_id`              |       |       |
| Avg favorites per `sync_id`   |       |       |

- **Behavior insights:**
  - доля сессий, в которых пользователь добавляет в избранное,
  - корреляция favorites ↔ покупки (если есть связь с заказами),
  - популярные категории/теги в избранном.

---

### 4. PWA & Re-engagement

Используйте PWA install metrics (`metrics/pwa-install-events`) и admin панель:

- **Install funnel:**

| Step                | Metric name         | Value | Notes |
| ------------------- | ------------------- | ----- | ----- |
| Prompt shown        | `prompt_available`  |       |       |
| Prompt accepted     | `prompt_accepted`   |       |       |
| Installed           | `installed`         |       |       |

- **Engagement:**
  - доля визитов с PWA‑клиентов (если различимы),
  - retention/return rate для PWA vs web.

---

### 5. Performance & UX KPIs (from budgets)

Сошлитесь на `docs/storefront-performance-budgets.json` и Lighthouse отчёты:

- **Per‑route metrics:**

| Route   | Perf score | LCP (ms) | CLS  | INP (ms) | Status vs budget |
| ------- | ---------- | -------- | ---- | -------- | ---------------- |
| `/`     |            |          |      |          |                  |
| `/catalog` |         |          |      |          |                  |
| `/product/ripple-fold-sheer` | |     |      |          |                  |

- Кратко объясните, как перф влияет на бизнес:
  - mobile LCP/INP и конверсия,
  - CLS и доверие/UX.

---

### 6. Segment Deep Dives (Optional)

Если доступно:

- **Device segmentation:** desktop vs mobile (отдельные воронки и KPI).
- **Traffic segmentation:** paid vs organic vs direct.
- **New vs returning:** различия в конверсии и среднем чеке.

Каждый сегмент можно оформить mini‑таблицей: sessions, conv%, AOV, engagement (favorites/PWA).

---

### 7. Insights & Actions

Разделите на:

- **Positive signals:** что уже хорошо работает (например, высокий adoption favorites, PWA, стабильный AOV).
- **Risks:** где тренд негативный (падение конверсии, рост отказов на конкретных страницах).
- **Planned actions:**
  - продуктовые (изменения in‑storefront),
  - маркетинговые (изменения в источниках трафика),
  - технические (перф/UX/a11y доработки).

Для каждого действия укажите:

- целевой KPI и ожидаемое изменение,
- как и когда будем переизмерять эффект (link на UX‑funnel или отдельный follow‑up отчёт).

