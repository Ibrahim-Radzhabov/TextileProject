# Аудит производительности скролла (Scroll Performance Audit)

**Дата:** 2026-04-23
**Проект:** TextileProject / Store Platform (apps/web)
**Статус:** Требуется доработка

---

## 🔴 Критичные проблемы (прямо вызывают лаги при скролле)

### 1. `setState` внутри обработчика `window` scroll — layout thrashing

**Файл:** `apps/web/app/(components)/hero-video-editorial.tsx`  
**Строки:** 64-86

```tsx
const onScroll = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();   // ← READ (форсирует layout)
    const vh = window.innerHeight;
    const scrolled = -rect.top / vh;
    const progress = clamp(...);
    setScrollFade({                              // ← WRITE (React re-render)
      opacity: 1 - progress,
      y: -progress * 40
    });
  });
};
window.addEventListener("scroll", onScroll, { passive: true });
```

**Почему лагает:**  
`getBoundingClientRect()` форсирует синхронный пересчёт layout. `setState` внутри `rAF` всё равно триггерит React re-render на каждый тик скролла. Даже с `passive: true` на слабых устройствах падает ниже 60 fps.

**Рекомендация:**  
Заменить на Framer Motion `useScroll` + `useTransform` (MotionValues обновляются вне React, без re-render) либо напрямую мутировать `ref.current.style` без React state.

---

### 2. Scroll-linked параллакс с `useScroll` + `useTransform`

**Файл:** `apps/web/app/(components)/hero-video-section.tsx`  
**Строки:** 45-50

```tsx
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start start", "end start"]
});
const mediaY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 24]);
const mediaScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 1.03]);
```

**Почему лагает:**  
`useScroll` слушает скролл и прокидывает значения через `useTransform` на каждый кадр. Одновременное применение `y` и `scale` к большому медиа-элементу (видео или high-res картинка) заставляет композитор перерисовывать огромную текстуру. `scale` в особенности ломает кэширование слоя.

**Рекомендация:**  
Убрать `scale` из scroll-linked трансформации или ограничить эффект десктопом. Добавить `will-change: transform` только на медиа-слой.

---

### 3. Layout thrashing в синхронизации горизонтального rail

**Файл:** `apps/web/app/home-page-client.tsx`  
**Строки:** 259-302

```tsx
const syncActiveIndex = () => {
  const railRect = rail.getBoundingClientRect();          // ← READ
  itemRefs.current.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect();        // ← READ в цикле!
    const visibleWidth = Math.max(0, Math.min(...));
    ...
  });
  setActiveIndex(closestIndex);                            // ← WRITE
};

const handleScroll = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(syncActiveIndex);
};

rail.addEventListener("scroll", handleScroll, { passive: true });
```

**Почему лагает:**  
`getBoundingClientRect()` вызывается в цикле по **каждому элементу rail**. Классическая forced synchronous layout (FSL). Количество DOM-измерений растёт линейно с числом элементов. Guard `if (frame)` не спасает — при быстром скролле `rAF` всё равно fire'ится непрерывно.

**Рекомендация:**  
Заменить на `IntersectionObserver` с threshold для определения наиболее видимого элемента. Полностью избавиться от измерений rect в scroll handler.

---

## 🟡 Высокая нагрузка (композитинг / paint cost)

### 4. Тяжёлые `backdrop-filter` + `box-shadow` на фиксированных элементах

**Файл:** `apps/web/app/globals.css`  
**Строки:** 45-53, 266-268

```css
.glass-panel {
  @apply ... backdrop-blur-lg;
  box-shadow: 0 8px 24px rgb(var(--color-foreground) / 0.04);
}
.glass-panel-strong {
  @apply ... backdrop-blur-xl;
  box-shadow: 0 14px 34px rgb(var(--color-foreground) / 0.08);
}
.pswp__button--arrow {
  backdrop-filter: blur(12px);
  box-shadow: 0 14px 30px rgb(58 46 38 / 0.08);
}
```

**Почему лагает:**  
`backdrop-filter` и `box-shadow` вместе — одни из самых дорогих CSS-свойств для композитинга. Когда они применены к sticky/fixed/анимированным элементам во время скролла, браузер вынужден пересчитывать blur фона на каждом кадре.

---

### 5. Фиксированное мобильное меню с `backdrop-blur`

**Файл:** `apps/web/app/(components)/mobile-bottom-nav.tsx`  
**Строка:** 62

```tsx
className="fixed inset-x-0 bottom-0 z-50 ... bg-card/95 backdrop-blur-md md:hidden"
```

**Почему лагает:**  
Fixed-элемент с `backdrop-blur-md` внизу вьюпорта = браузер переблюривает скроллящийся контент под ним на каждом кадре. На мобильных GPU особенно дорого.

**Рекомендация:**  
На мобильных заменить на сплошной полупрозрачный фон без blur.

---

### 6. Фиксированная чекаут-панель с `backdrop-blur`

**Файл:** `apps/web/app/checkout/page.tsx`  
**Строка:** 293

```tsx
<div className="fixed inset-x-0 bottom-0 z-40 ... bg-background/95 ... backdrop-blur-sm md:hidden">
```

Аналогично пункту 5 — fixed blur layer над скроллящимся контентом.

**Рекомендация:**  
Убрать `backdrop-blur-sm` на мобильных, оставить только `bg-background/95`.

---

### 7. Оверлей сайдбара с `backdrop-blur` на весь вьюпорт

**Файл:** `apps/web/app/(components)/sidebar-menu.tsx`  
**Строка:** 601

```tsx
<motion.div className="fixed inset-0 z-[58] bg-[rgba(71,62,52,0.18)] backdrop-blur-[2px]" ... />
```

**Почему лагает:**  
Даже 2px blur на full-viewport fixed overlay дорого композитить, особенно когда анимация открытия меню совпадает со скроллом страницы.

---

### 8. `filter: blur(10px)` на декоративном псевдо-элементе

**Файл:** `apps/web/app/globals.css`  
**Строки:** 209-221

```css
.home-concept-editorial::before {
  ...
  filter: blur(10px);
  z-index: -1;
}
```

**Почему лагает:**  
Псевдо-элемент покрывает большую площадь (`inset: -8px 0 auto 0; height: 150px`) с 10px blur. Добавляет paint cost всей странице.

---

## 🟡 Средняя нагрузка (анимации / state)

### 9. `whileInView` обёртки на каждом блоке страницы

**Файл:** `apps/web/app/home-page-client.tsx`  
**Строки:** 580-588

```tsx
<motion.div
  key={`reveal-${block.id}`}
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
```

**Почему лагает:**  
Каждый блок на homepage получает свой `whileInView` observer. Framer Motion создаёт внутренний `IntersectionObserver` на каждый инстанс. С множеством блоков (hero + grids + rails + CTAs) это умножает накладные расходы. Margin `-80px` заставляет браузер вычислять intersection с не-root margin.

**Рекомендация:**  
Использовать один shared `IntersectionObserver` hook или сократить число независимо наблюдаемых элементов.

---

### 10. `LayoutGroup` оборачивает весь app shell

**Файл:** `apps/web/app/storefront-shell.tsx`  
**Строки:** 461-464

```tsx
{enableSharedProductTransition ? (
  <LayoutGroup id="storefront-shared-elements">
    {children}
  </LayoutGroup>
) : (
  children
)}
```

**Почему лагает:**  
`LayoutGroup` заставляет Framer Motion отслеживать layout changes **всех** children. При скролле любой layout shift (загрузка картинок, изменение позиции sticky) триггерит измерение layout внутри группы.

---

### 11. Shared element transition (`layoutId`) на заголовке продукта

**Файл:** `apps/web/app/product/[slug]/product-page-client.tsx`  
**Строки:** 389-396

```tsx
<motion.h1
  layoutId={sharedTitleLayoutId}
  transition={springSharedElement}
>
```

**Почему лагает:**  
`layoutId` включает shared element transitions. При скролле на product page sticky sidebar может вызывать сдвиг заголовка, что триггерит layout projection calculations.

---

## 🟢 Низкая / кумулятивная нагрузка

### 12. Картинки без lazy loading и Next.js optimization

**Файл:** `apps/web/app/catalog/catalog-page-client.tsx`  
**Строки:** 306-310

```tsx
<img
  src={product.media[0]?.url}
  alt={product.media[0]?.alt ?? product.name}
  className="h-full w-full object-cover"
/>
```

**Почему лагает:**  
Сырые `<img>` без `loading="lazy"` декодируют синхронно на main thread. В длинном каталоге каждый decode тормозит скролл.

**Рекомендация:**  
Добавить `loading="lazy" decoding="async"` или мигрировать на `next/image`.

---

### 13. `will-change` на ticker тексте

**Файл:** `apps/web/components/AnnouncementTicker.module.css`  
**Строка:** 92

```css
.message {
  will-change: transform, opacity;
}
```

Минорно — корректно скоуплено, но резервирует GPU memory.

---

### 14. Ken Burns анимация на hero медиа

**Файл:** `apps/web/app/globals.css`  
**Строки:** 184-196

```css
@keyframes hero-ken-burns {
  0%   { transform: scale(1); }
  100% { transform: scale(1.06); }
}
.hero-ken-burns {
  animation: hero-ken-burns 14s ... forwards;
}
```

**Почему лагает:**  
Непрерывная scale-анимация на большом hero заставляет композитор постоянно перерисовывать слой. В сочетании со scroll-linked transforms (пункт 2) компондует cost.

---

## 📋 Сводная таблица

| # | Файл | Строки | Тип проблемы | Серьёзность |
|---|------|--------|--------------|-------------|
| 1 | `app/(components)/hero-video-editorial.tsx` | 64-86 | `setState` + `getBoundingClientRect` в scroll | 🔴 Критично |
| 2 | `app/(components)/hero-video-section.tsx` | 45-50 | `useScroll` + `useTransform` parallax | 🔴 Критично |
| 3 | `app/home-page-client.tsx` | 259-302 | Layout thrashing в rail scroll loop | 🔴 Критично |
| 4 | `app/globals.css` | 45-53, 266-268 | `backdrop-filter` + `box-shadow` глобально | 🟡 Высоко |
| 5 | `app/(components)/mobile-bottom-nav.tsx` | 62 | Fixed `backdrop-blur-md` | 🟡 Высоко |
| 6 | `app/checkout/page.tsx` | 293 | Fixed `backdrop-blur-sm` | 🟡 Высоко |
| 7 | `app/(components)/sidebar-menu.tsx` | 601 | Full-viewport `backdrop-blur-[2px]` | 🟡 Высоко |
| 8 | `app/globals.css` | 209-221 | `filter: blur(10px)` на псевдо-элементе | 🟡 Высоко |
| 9 | `app/home-page-client.tsx` | 580-588 | Множественные `whileInView` observers | 🟡 Средне |
| 10 | `app/storefront-shell.tsx` | 461-464 | `LayoutGroup` на весь app | 🟡 Средне |
| 11 | `app/product/[slug]/product-page-client.tsx` | 389-396 | `layoutId` + sticky sidebar | 🟡 Средне |
| 12 | `app/catalog/catalog-page-client.tsx` | 306-310 | `<img>` без lazy loading | 🟢 Низко |
| 13 | `components/AnnouncementTicker.module.css` | 92 | `will-change` (минорно) | 🟢 Низко |
| 14 | `app/globals.css` | 184-196 | Ken Burns continuous scale | 🟢 Низко |

---

## 💡 Приоритетные рекомендации

1. **Заменить ручные scroll handlers на `useScroll` / MotionValues** (пункты 1, 3) — полностью убрать `setState` и `getBoundingClientRect` из scroll path.
2. **Убрать или уменьшить `backdrop-filter` на fixed/sticky элементах** (пункты 4-8) — на мобильных использовать сплошные полупрозрачные фоны.
3. **Консолидировать `whileInView` observers** (пункт 9) — один shared IntersectionObserver вместо десятков.
4. **Добавить `loading="lazy"` и `decoding="async"` на все каталоговые картинки** (пункт 12).

---

*Файл создан автоматически на основе аудита кодовой базы.*
