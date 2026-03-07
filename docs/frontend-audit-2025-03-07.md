# Аудит фронта store-platform (без изменений кода)

**Дата:** 2025-03-07  
**Ветка:** main  
**Точка:** после c396ea3b

## Что реализовано

### Общее
- Next.js 14 App Router, корневой `layout.tsx` с `generateMetadata` / `generateViewport`, тема из `fetchStorefrontConfig()`, CSS variables через `themeToCssVars`, `StorefrontShell` с `LayoutShell`, `TopNav`, `Footer`, `CartDrawer`, `MobileBottomNav`, `PwaInstallPrompt`.
- Multi-tenant: `CLIENT_ID` используется в Makefile, API загружает конфиг из `clients/{CLIENT_ID}/*.json` (loaders.py). Web вызывает API `/storefront/config` для конфига.
- Стек: Tailwind, Framer Motion, Zustand (cart, favorites), RHF+Zod в формах.

### Header / TopNav
- `LayoutShell`: sticky-блок с `motion.div` и `Surface`, при скролле `isScrolled` меняет тон (ghost → elevated) и **меняет padding** (px-0 py-1 → px-3 py-2.5 sm:px-4), что даёт **layout shift** по вертикали.
- `TopNav`: логотип/монограмма, desktop nav (скрыт на md), mobile drawer (AnimatePresence), Escape закрывает меню, `aria-label`, `aria-expanded`, `aria-controls`, `focus-visible:ring`. Кнопка меню только при `rightSlot` и только на md:hidden.

### Footer
- `Footer`: trust-блок (3 карточки), колонки ссылок, контакты, соцсети, CTA, копирайт и legal links. Всё из конфига в `storefront-shell`. Визуально плотный (много секций подряд).

### Карточки товаров
- `ProductCard`: варианты default, editorial, name-price. На главной используется `variant="name-price"`. Сетка в `HomePageClient`: `grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4`, `auto-rows-fr`, Framer `gridContainerVariants` / `gridItemVariants`.
- CTA: кнопка «Подробнее» с `asChild` и ссылкой на `/product/[slug]`; поверх карточки есть обёртка-ссылка на весь блок (a11y ок).
- `FavoriteToggleButton`: overlay (absolute top/right), CSS-анимации filled-pop, ring-burst, celebrate-burst; `prefers-reduced-motion` отключает анимации. Кнопка не должна сдвигать layout (absolute, burst вне потока).

### Hero
- Главная: hero из `pages.json` с `media.type === "video"`, `contentPlacement`: overlay или below. `HeroPinnedVideo` рендерит `HeroMedia` (video + poster, fallback на img при onError), опционально overlay с копирайтом.
- Нет horizontal scroll/parallax. Видео: autoPlay, muted, loop, playsInline, poster, mobileSrc; при saveData или ошибке — показ poster/картинки.

### SEO
- `layout.tsx`: `generateMetadata()` и `generateViewport()` вызывают `getStorefrontConfig()` → `fetchStorefrontConfig()` (API). При build без API запрос упадёт или зависнет — **metadata зависит от поднятого API**.
- `app/page.tsx`: `generateMetadata()` тоже через `fetchStorefrontConfig()`.
- `sitemap.ts`: вызывает `fetchStorefrontConfig()` для продуктов; при ошибке возвращает только статические маршруты (главная, каталог) — **частичный fallback**.
- `robots.ts`: не зависит от API (resolveSiteUrl из env).

## Что сломано / незавершено

1. **SEO при build без API**: metadata (layout + страницы) и полный sitemap требуют ответа API. Build-time генерация (SSG/ISR) без поднятого API не отработает. Нужна загрузка из `clients/{CLIENT_ID}/*.json` на build (Node/fs) с fallback на API при runtime revalidate.
2. **Layout shift в header**: смена padding при скролле меняет высоту sticky-блока. Нужен фиксированный резерв высоты (min-height или стабильный padding).
3. **Footer**: по ТЗ «без визуального перегруза» — можно слегка разрядить отступы/сетку, не меняя структуру.
4. **Карточки**: сетка в целом стабильна; проверить единообразие отступов и что CTA всегда видна и ведёт на товар. Анимация избранного — убедиться, что нет смещений (overflow/contain).
5. **Hero**: дублирующих текстовых блоков в текущей конфигурации нет; видео уже с fallback. Оставить как есть, при необходимости только проверить стабильность рендера.

## Inline styles и цвета

- `layout.tsx`: `body style={themeStyle}` — инъекция CSS variables из темы (допустимо).
- `HeroMedia`: `style={assetStyle}` (objectPosition из конфига), `style={{ opacity: overlayOpacity }}` — из props.
- Остальные упоминания (Button ripple, AnimatedFilterInput gradient) — динамические значения, не hardcoded цвета. Явных нарушений «никаких inline styles / hardcoded цветов вне theme/config» не выявлено.

## Рекомендации по приоритетам

1. Ввести build-time источник конфига (fs) для metadata/sitemap и опционально для layout, с fallback на API.
2. Убрать layout shift header: фиксированная высота/минимальный padding обёртки.
3. Полировка карточек: единые отступы, проверка CTA и overflow для кнопки избранного.
4. Hero и Footer — минимальные правки только при необходимости.
