## UI Regression Report (Storefront)

**Scope:** Visual / layout / interaction регрессии в публичном storefront (`/`, `/catalog`, `/product/[slug]`, `/favorites`, `/checkout`).

---

### 1. Summary

- **Context:** какая серия изменений проверялась (коммиты, ветка, фича — например, новый `AnimatedDock`, изменения hero, mobile bottom‑nav).
- **Result:** есть ли критичные визуальные/поведенческие регрессии.
- **Test surface:**
  - Playwright визуальные снапшоты (`storefront-visual.spec.ts`),
  - smoke‑скрипт `scripts/storefront-smoke.mjs` (ширины 390/768/1024/1280),
  - ручная проверка (если была).

---

### 2. Routes & Viewports

- **Core routes:**
  - `/` (home / hero / header/footer),
  - `/catalog`,
  - `/product/ripple-fold-sheer`,
  - `/favorites`,
  - `/checkout`, `/checkout/success` (по необходимости).
- **Target viewports:**
  - 390 × 844 (mobile),
  - 768 × 1024 (tablet),
  - 1024 × 900 (small desktop),
  - 1280 × 900 (desktop).

Сошлитесь на соответствующие конфиги/тесты:

- `tests/e2e/storefront-visual.spec.ts`,
- `scripts/storefront-smoke.mjs` (viewport QA + overflow checks).

---

### 3. Visual Snapshot Status

> Заполняется по результатам запуска `corepack pnpm e2e:visual` и/или smoke‑скрипта.

Для каждого маршрута/viewport:

| Route   | Viewport  | Baseline status | Diff summary           |
| ------- | --------- | ----------------| ---------------------- |
| `/`     | 390x844   | pass / fail     | описание отличий      |
| `/`     | 1280x900  | pass / fail     | …                      |
| `/catalog` | 768x1024 | …             | …                      |

Если есть диффы:

- коротко описать: именно регрессия или ожидаемое изменение,
- нужно ли обновлять baseline или чинить код.

---

### 4. Layout & Overflow Checks

- **Automated:**
  - `storefront-transition.spec.ts` — отсутствие горизонтального overflow catalog/PDP.
  - `scripts/storefront-smoke.mjs` — проверка overflow и ошибок в консоле на основных маршрутах.
- **Manual notes:**
  - какие экраны/устройства проверяли руками,
  - обнаруженные скролл‑бары, сдвиги layout, «дрожание» при hover/transition.

Таблица для фикса:

| Area          | Device / width | Status (OK / issue) | Notes |
| ------------- | -------------- | ------------------- | ----- |
| Header + dock | 1280           |                     |       |
| Catalog grid  | 390            |                     |       |
| PDP gallery   | 768            |                     |       |

---

### 5. Interaction Regressions

Покройте ключевые флоу:

- **Header / navigation:**
  - клики по `AnimatedDock` (Home / Search / Favorites / Cart),
  - mobile drawer (открытие/закрытие, overlay, ESC) — см. `top-nav-footer.spec.ts`.
- **Catalog:**
  - поиск/фильтры (`CatalogNeonFilter`, mini‑rail),
  - переходы в PDP, back‑навигация.
- **Favorites:**
  - взаимодействие с сердцем на карточках,
  - соответствие состояний между `/`, `/catalog`, `/favorites`, PDP.
- **Checkout / PWA (если релевантно):**
  - отсутствие блокирующих ошибок в консоле,
  - корректное поведение PWA‑баннера.

Для каждого обнаруженного регресса:

- опишите ожидаемое vs фактическое поведение,
- укажите шаги воспроизведения,
- отметьте, есть ли покрытие в Playwright и надо ли его расширить.

---

### 6. Recommendations & Next Steps

- **Must‑fix before merge:**
  - … (регрессии, ломающие критичный UX/brand‑вид).
- **Acceptable changes:** диффы, которые считаются частью новой версии UI (базовые обновления шрифтов, paddings и т.п.) — отметить, что baseline нужно обновить.
- **Test suite updates:**
  - какие новые `@visual` сценарии добавить,
  - какие smoke‑проверки расширить (новые маршруты/брейкпоинты).

---

### 7. Attachments

- Ссылки/пути к дифф‑скриншотам (`tests/e2e/storefront-visual.spec.ts-snapshots/*` или артифакты CI).
- Логи `storefront-smoke` (если использовались).
- Ссылки на PR/коммиты, с которыми связан отчёт.

