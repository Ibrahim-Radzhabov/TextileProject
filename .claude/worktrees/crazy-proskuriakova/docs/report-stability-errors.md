## Stability & Error Report (API + Storefront)

**Scope:** Ошибки и сбои для витрины и API за выбранный период (например, неделя релиза).

---

### 1. Summary

- **Period:** даты/таймзона.
- **Release / tag / commit range:** что именно выкатывалось.
- **Overall stability:** кратко — число критичных инцидентов, средний error‑rate, есть ли повторяющиеся проблемы.
- **Impact:** какие пользовательские флоу пострадали (browse, favorites, checkout, admin).

---

### 2. Data Sources

Опишите откуда берутся данные:

- backend логи (`uvicorn`, `apps/api`),
- APM/обсервабилити (если есть),
- admin панели/метрики:
  - заказы (`/orders`, статус/`payment_state`),
  - webhooks (`/webhooks/audit`),
  - PWA install metrics (`/metrics/pwa-install-events`),
  - favorites metrics (`/metrics/favorites-events`),
- Playwright / Lighthouse отчёты:
  - `storefront-smoke.mjs` (консольные ошибки, HTTP‑коды),
  - perf/PWA Lighthouse скрипты (если используются).

---

### 3. Error Budget & Targets

Задайте ожидаемые границы:

- **HTTP API:**
  - 5xx‐rate на ключевых эндпоинтах (`/storefront/config`, `/catalog`, `/checkout`, `/orders`).
- **Web storefront:**
  - JS‐errors per 1k pageviews,
  - наличие/отсутствие «красных» ошибок в DevTools на ключевых маршрутах.
- **Background flows:**
  - Stripe webhooks — процент успешно обработанных событий (`processing_status=processed`),
  - PWA/favorites метрики — отсутствие 4xx/5xx при `metrics/*` запросах.

---

### 4. Incident Log (Human-readable)

Для каждого значимого инцидента:

- **ID / date / time.**
- **Severity:** Critical / High / Medium / Low.
- **Surface:** API, storefront, admin, integrations (Stripe/Telegram).
- **Description:** что именно происходило (симптомы).
- **Detection:** кем/чем обнаружено (мониторинг, пользователь, тесты).
- **Timeline:** когда началось, когда исправлено.
- **Root cause (if known).**
- **Mitigation / fix.**

Рекомендуемая таблица:

| ID     | When          | Severity | Surface   | Summary                    | Status |
| ------ | ------------- | -------- | --------- | -------------------------- | ------ |
| INC-01 | 2026‑03‑07    | High     | Checkout  | …                          | fixed  |

---

### 5. Quantitative Error Metrics

> Таблицы/диаграммы, которые можно собрать из логов/метрик.

- **API 5xx by endpoint (top N):**

| Endpoint                       | Count | % of requests | Notes |
| ------------------------------ | ----- | ------------- | ----- |
| `GET /storefront/config`      |       |               |       |
| `POST /checkout`              |       |               |       |
| `GET /orders`                 |       |               |       |

- **Webhook processing:**

| Metric                        | Value | Notes |
| ----------------------------- | ----- | ----- |
| Stripe webhooks received      |       |       |
| Stripe webhooks processed OK  |       |       |
| Stripe webhooks failed        |       |       |

- **Front‑end JS errors:**

Если есть сбор с клиента — топ стек‑трейсы/сообщения, маршруты, устройства.

---

### 6. Checkout & Payments Health

Используйте уже существующие эндпоинты/тесты:

- контракты `POST /checkout` (см. E2E `storefront-admin.spec.ts`),
- статус заказов (`/orders`, `payment_state=…`),
- Stripe webhook audit (`/webhooks/audit`).

Опишите:

- процент заказов, успешно дошедших до `paid / confirmed`,
- частоту проблемных статусов (`failed`, `cancelled`, «зависшие»),
- все ли заказы из webhooks отражаются в `orders` и `webhooks/audit`.

---

### 7. Recommendations

Разделите на:

- **Monitoring / alerting:**
  - какие алерты добавить (например, рост 5xx для `/checkout`, падение успешных webhooks).
- **Hardening / retries:**
  - где нужны явные ретраи или лучшее сообщение пользователю (например, при падении Stripe/Telegram).
- **Tech debt:**
  - логи, которые нужно структурировать,
  - места, где стоит добавить `order_status`/`processing_status` аудит и т.п.

---

### 8. Follow-up & Owners

- ответственные за API и web,
- запланированные даты исправлений,
- как будет проверяться исправление (конкретные тесты/скрипты: `smoke:storefront`, perf/pwa Lighthouse, e2e).

