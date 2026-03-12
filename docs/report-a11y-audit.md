## Accessibility Audit (Storefront)

**Scope:** Public storefront (`/`, `/catalog`, `/product/[slug]`, `/favorites`, `/checkout`, `/checkout/success`) for demo client.

---

### 1. Executive Summary

- **WCAG target level:** e.g. `WCAG 2.1 AA`.
- **Overall status:** кратко — ближе к compliant / имеет критичные блокеры.
- **Devices & assistive tech (if used):**
  - desktop (screen readers, high contrast, keyboard only),
  - mobile (screen readers, zoom, orientation).
- **High‑risk issues:** 3–5 пунктов, реально мешающих пользователям.

---

### 2. Evaluation Background

- **Dates / build:** тег/commit, ветка, дата прогона.
- **Environment:** локально / staging / production, флаги (`NEXT_PUBLIC_ENABLE_SHARED_PRODUCT_TRANSITION`, др.).
- **Methods:**
  - manual keyboard‑only walkthrough (каталог → PDP → checkout),
  - screen reader smoke (если применимо),
  - automated checks (axe/Lighthouse/Playwright).
- **Reference docs:** WCAG 2.1, WAI‑ARIA Authoring Practices.

---

### 3. Scope & Pages

- **Pages:**
  - `/` — home/hero/navigation.
  - `/catalog` — поиск, фильтры, карточки.
  - `/product/[slug]` — галерея, CTA, сводка.
  - `/favorites` — список сохранённых товаров.
  - `/checkout` и `/checkout/success` — формы, сообщения.
- **States:**
  - пустые/заполненные списки,
  - ошибки форм,
  - модальные/оверлеи (mobile drawer, PWA‑баннер).

---

### 4. Summary of Findings

Сгруппируйте по приоритету и типу:

- **Critical (blocker):**
  - … (невозможно оформить заказ с клавиатуры / недостижимый CTA и т.д.).
- **High:**
  - … (значимые проблемы восприятия/навигации).
- **Medium / Low:**
  - … (улучшения удобства, но не блокеры).

Можно оформить как таблицу:

| Priority | Area        | Short description                         |
| -------- | ----------- | ----------------------------------------- |
| Critical | Checkout    | …                                         |
| High     | Catalog     | …                                         |
| Medium   | Header/nav  | …                                         |

---

### 5. Detailed Issues (Per WCAG Criterion)

Для каждой записи:

- **ID:** `A11Y-XXX`.
- **Page / location:** маршрут + компонент (например, `catalog-page-client`, `ProductCard`, `MobileBottomNav`).
- **Description:** что именно не так (role/label/focus/contrast/structure).
- **WCAG mapping:** критерий (например, `2.4.3 Focus Order`, `1.3.1 Info and Relationships`).
- **Impact:** на кого влияет (keyboard only, low vision, screen reader users).
- **Repro steps:**
  1. …
  2. …
  3. …
- **Recommendation:** конкретное исправление (например, добавить `aria-label`, скорректировать `tabindex`, изменить цвет токена в теме).

Рекомендуемый формат таблицы для приложений/листинга:

| ID       | Page / area | Severity | WCAG | Issue | Recommendation | Notes |
| -------- | ----------- | -------- | ---- | ----- | -------------- | ----- |
| A11Y-001 | `/catalog`  | High     | 2.4.3| …     | …              | …     |

---

### 6. Automated Checks & Regression Guards

- **Existing suites:**
  - `tests/e2e/storefront-a11y.spec.ts` — keyboard reachability catalog → PDP → add‑to‑cart.
  - `tests/e2e/top-nav-footer.spec.ts` — focus trap, ESC/overlay закрытие мобильного меню.
  - PWA checks (`pwa-smoke.spec.ts`) — install banner, offline fallback.
- **Gaps:** какие области UI пока не покрыты автоматикой (например, формы checkout, admin).
- **Proposed additions:**
  - новые тест‑кейсы Playwright для специфических a11y‑сценариев,
  - Lighthouse accessibility score thresholds (если нужны).

---

### 7. Recommended Fix Plan

Разбейте на итерации:

- **Wave 1 (P0):**
  - исправить критичные/высокие проблемы на core‑флоу `/catalog → /product → /checkout`.
- **Wave 2 (P1):**
  - улучшить навигацию по избранному, героям, фильтрам.
- **Wave 3 (P2):**
  - доработать мелкие вещи (aria‑описания, тонкие контрасты, анимации с учётом `prefers-reduced-motion`).

Для каждой волны:

- ожидаемый эффект (какие пользователи выигрывают),
- как будем проверять (какие тесты/ручные проверки запускаем).

