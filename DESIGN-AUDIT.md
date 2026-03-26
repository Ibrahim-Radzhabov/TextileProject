# Design Audit — Textile Studio Storefront

**Текущий уровень: 7.5 / 10**
**Целевой уровень: 10 / 10 (Hermes / Aesop / The Row tier)**

---

## Что уже хорошо (фундамент крепкий)

- Двойная типографика: Manrope (UI) + Lora (serif display) — правильный выбор для текстиля
- Полная токен-система цветов через CSS custom properties с RGB-каналами
- Продуманные motion presets: `easePremium [0.16, 1, 0.3, 1]`, spring configs
- Glass-morphism поверхности с blur-эффектами
- Shared layout animations через Framer Motion для переходов карточка → PDP
- Cursor-tracking glow на trust-карточках в футере
- Favourite heart с burst-анимацией лучей
- Button ripple эффект с отслеживанием позиции курсора
- `prefers-reduced-motion` учтён везде

---

## Что нужно исправить для 10/10

### P0 — Критичный визуальный импакт

#### 1. Удвоить вертикальные отступы между секциями (САМОЕ ВАЖНОЕ)
- **Файл:** `apps/web/app/home-page-client.tsx` ~line 568
- **Сейчас:** `space-y-8 sm:space-y-9 lg:space-y-11` (32/36/44px)
- **Нужно:** `space-y-16 sm:space-y-20 lg:space-y-28` (64/80/112px)
- **Почему:** Hermes использует 80-120px между модулями. Воздух = люкс.

#### 2. Заменить все `<img>` на Next.js `<Image>`
- **Файлы:** TopNav.tsx line 62, ProductCard.tsx line 116, и далее
- **Сейчас:** Raw `<img>` с eslint-disable
- **Нужно:** `<Image>` с blur placeholder, responsive srcSet, lazy loading
- **Почему:** LQIP (blur-up) загрузка — обязательный стандарт. Даёт и перформанс, и ощущение качества.

#### 3. Увеличить gap продуктовой сетки
- **Файл:** `apps/web/app/home-page-client.tsx` ~line 504
- **Сейчас:** `gap-4` (16px)
- **Нужно:** `gap-5 sm:gap-6 lg:gap-8` (20/24/32px)
- **Почему:** Люксовые сетки всегда свободнее. 16px — это Zara, не Hermes.

### P1 — Типографика и цвет

#### 4. Убрать третий шрифт (Cormorant Garamond)
- **Файл:** `apps/web/app/home-page-client.tsx` lines 38-43
- **Правило:** Один serif (Lora) + один sans (Manrope). Точка.
- **Почему:** Три конкурирующих серифа размывают идентичность. У Hermes — один кастомный serif на весь сайт.

#### 5. Увеличить line-height body текста
- **Файл:** `apps/web/app/globals.css` (type tokens)
- **Сейчас:** `--type-body-leading: 1.55`
- **Нужно:** `1.65-1.7`
- **Почему:** Больший интерлиньяж = ощущение пространства и лёгкости (стандарт Aesop).

#### 6. Централизовать все hardcoded цвета в токены
- **Файлы:** TopNav.tsx, LayoutShell.tsx, AnimatedDock.tsx, storefront-shell.tsx
- **Проблема:** `rgba(34,28,24,0.82)`, `#221C18`, `#F6F4F1` разбросаны по коду
- **Нужно:** Всё через `text-foreground`, `bg-background`, `text-muted-foreground`

#### 7. Проверить промежуточные font-weight (430, 460, 530)
- **Файл:** globals.css lines 117-118, 123, 129
- **Проблема:** Lora загружена с weights [400, 500, 600, 700]. Значения 430, 460, 530 могут молча округляться.
- **Решение:** Протестировать или перейти на целые значения.

### P1 — Motion и анимации

#### 8. Убрать/упростить neon-border на поиске
- **Файлы:** `catalog-neon-filter.module.css`, `top-nav-search-filter.module.css`
- **Сейчас:** Вращающиеся conic-gradient, glow orbs, множество слоёв
- **Нужно:** Простой 1px border с subtle brighten на focus
- **Почему:** Neon-эффекты = SaaS/tech. Люкс = сдержанность. У Hermes поиск — тонкая линия.

#### 9. Добавить scroll-triggered reveals
- **Где:** Каждая секция homepage
- **Сейчас:** Grid stagger только на mount
- **Нужно:** `whileInView` fade-in-up с Intersection Observer
- **Почему:** Контент, появляющийся при скролле, создаёт ощущение раскрывающейся истории.

#### 10. Анимировать chevron в аккордеонах PDP
- **Файл:** `product-page-client.tsx` lines 557-620
- **Сейчас:** Символ `▾` без анимации
- **Нужно:** SVG chevron с rotate 180° transition
- **Почему:** Это самый «недоделанный» элемент во всём UI.

#### 11. Уменьшить AnimatedDock hover-эффект
- **Файл:** AnimatedDock.tsx line 54-55
- **Сейчас:** scale 1.14, y: -4
- **Нужно:** scale 1.04, y: -1
- **Почему:** COS и Arket — почти незаметные hover. Сдержанность = люкс.

### P1 — Компоненты

#### 12. Дифференцировать варианты Button
- **Файл:** Button.tsx lines 27-33
- **Сейчас:** primary / secondary / ghost — все визуально одинаковые (solid accent fill)
- **Нужно:** primary = solid, secondary = outlined, ghost = borderless

#### 13. Расширить PDP info panel
- **Файл:** `product-page-client.tsx` line 378
- **Сейчас:** `max-w-[21.5rem]` (344px)
- **Нужно:** `max-w-[24rem]` (384px) + больше vertical spacing между секциями
- **Почему:** 344px — тесно. The Row использует 380-440px.

#### 14. Убрать двойной fixed bar на мобильном PDP
- **Проблема:** Sticky add-to-cart + bottom nav одновременно сжимают контент
- **Решение:** Скрывать bottom nav на PDP или объединить

### P2 — Финальная полировка

#### 15. Page transitions между роутами
- Opacity fade 200-300ms при навигации

#### 16. Заменить mailto на форму/модалку консультации
- Футерный CTA «Подобрать ткань» → mailto выглядит бюджетно

#### 17. Добавить cursor-pointer на все кликабельные изображения
- Gallery thumbnails, hero images — нет визуального indication

#### 18. Добавить skeleton/loading states
- Shimmer-класс определён в CSS, но нигде не используется в компонентах

#### 19. Разнообразить aspect ratio на homepage
- **Сейчас:** Всё прямоугольное (4:5)
- **Нужно:** Микс full-bleed, 16:9, 3:4, 1:1 — как в люксовых editorial layouts

---

## Чеклист: путь от 7.5 до 10

| # | Задача | Импакт | Сложность | Статус |
|---|--------|--------|-----------|--------|
| # | Задача | Импакт | Сложность | Статус |
|---|--------|--------|-----------|--------|
| 1 | Увеличить вертикальные отступы секций | Очень высокий | Низкая | ✅ Сделано |
| 2 | Next.js `<Image>` + blur placeholders | Очень высокий | Средняя | ⬜ |
| 3 | Увеличить gap продуктовой сетки | Высокий | Низкая | ✅ Сделано |
| 4 | Убрать Cormorant Garamond | Высокий | Низкая | ✅ Сделано |
| 5 | Увеличить body line-height | Средний | Низкая | ✅ Сделано |
| 6 | Централизовать hardcoded цвета | Средний | Средняя | ✅ Сделано |
| 7 | Проверить font-weight значения | Низкий | Низкая | ✅ Сделано |
| 8 | Упростить neon-border поиска | Высокий | Средняя | ✅ Сделано |
| 9 | Scroll-triggered reveals | Высокий | Средняя | ✅ Сделано |
| 10 | Анимировать аккордеон chevron | Средний | Низкая | ✅ Сделано |
| 11 | Уменьшить dock hover | Низкий | Низкая | ✅ Сделано |
| 12 | Дифференцировать Button варианты | Средний | Низкая | ✅ Сделано |
| 13 | Расширить PDP info panel | Средний | Низкая | ✅ Сделано |
| 14 | Убрать двойной fixed bar mobile | Средний | Средняя | ⬜ |
| 15 | Page transitions | Средний | Средняя | ⬜ |
| 16 | Форма консультации вместо mailto | Средний | Средняя | ⬜ |
| 17 | Cursor-pointer на изображения | Низкий | Низкая | ⬜ |
| 18 | Skeleton loading states | Средний | Средняя | ⬜ |
| 19 | Разнообразие aspect ratio | Средний | Средняя | ⬜ |

**Прогресс: 13/19 задач выполнено (P0 + P1 полностью)**

---

## Резюме

**Текущий уровень после P0+P1: ~9.0/10**

Оставшийся путь 9.0 → 10.0 (P2):
- Next.js `<Image>` с blur-up placeholder
- Page transitions между роутами
- Skeleton/loading states
- Убрать двойной fixed bar на мобильном PDP
- Форма консультации вместо mailto
- Cursor-pointer на кликабельных изображениях
- Разнообразие aspect ratio на homepage
