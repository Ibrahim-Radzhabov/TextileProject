# Задача: Заменить все `<img>` на Next.js `<Image>` с blur placeholder

## Контекст
Проект — премиальный текстильный e-commerce (Velura). Все изображения товаров сейчас загружаются через raw `<img>` теги. Нужно заменить на Next.js `<Image>` для автоматической оптимизации, lazy loading и blur-up эффекта при загрузке.

**Уровень дизайна:** люкс-tier (Hermès/Aesop). Blur-up загрузка — обязательный стандарт для этого уровня.

## Текущее состояние

### Где используются `<img>` теги

1. **`packages/ui/src/components/ProductCard.tsx`** — карточка товара в сетке
   - Основное изображение + hover-изображение (crossfade)
   - `<img src={...} className="absolute inset-0 h-full w-full object-cover" />`

2. **`packages/ui/src/components/ProductGallery.tsx`** — gallery на PDP
   - Desktop: grid изображений (~line 1020)
   - Mobile: active image (~line 1050)
   - Zoom viewer: fullscreen image (~line 872)
   - `<img src={item.url} alt={item.alt} className="absolute inset-0 h-full w-full object-cover" />`

3. **`packages/ui/src/components/TopNav.tsx`** — логотип магазина (~line 62)
   - `<img src={logo.src} alt={logo.alt} className="h-full w-full object-cover" />`
   - У этого `<img>` есть `// eslint-disable-next-line @next/next/no-img-element`

4. **`apps/web/app/home-page-client.tsx`** — editorial rail карточки
   - Журнальные изображения (~line 397)

### Источник изображений
- Товарные изображения приходят из API как URL: `/demo/satin_one.jpeg`, `/demo/airy-voile-tulle.svg` и т.д.
- Они лежат в `apps/web/public/demo/` — это **локальные файлы**, не внешние URL
- Формат `ProductMedia`: `{ id: string; url: string; alt: string; width?: number; height?: number }`

### Архитектура
```
apps/web/                    — Next.js 14 App Router (порт 3001)
packages/ui/                 — shared UI library (используется в apps/web)
```

`packages/ui` — это библиотека компонентов, она **не знает** про `next/image` напрямую. Есть два подхода:

## Подход A: Image wrapper в apps/web (рекомендуется)

1. Создать `apps/web/components/optimized-image.tsx` — обёртка над `next/image`
2. В `packages/ui` добавить prop `imageComponent` в `ProductCard`, `ProductGallery` и т.д.
3. В `apps/web` передавать `OptimizedImage` через prop

**Плюсы:** UI library остаётся framework-agnostic. Чистое разделение.

## Подход B: next/image напрямую в packages/ui

1. Добавить `next` как peerDependency в `packages/ui/package.json`
2. Заменить `<img>` на `<Image>` напрямую

**Плюсы:** Проще. **Минусы:** UI library привязана к Next.js.

## Инструкция по реализации (Подход A)

### Шаг 1: Создать Image wrapper

Создай `apps/web/components/optimized-image.tsx`:

```tsx
"use client";

import Image, { type ImageProps } from "next/image";

type OptimizedImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  draggable?: boolean;
};

export function OptimizedImage({
  src,
  alt,
  fill = true,
  className,
  style,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  priority = false,
  onLoad,
  ...rest
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      style={style}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={generateBlurPlaceholder()}
      onLoad={onLoad}
      {...rest}
    />
  );
}

// Минимальный blur placeholder — 1x1px прозрачный с blur
function generateBlurPlaceholder(): string {
  return "data:image/svg+xml;base64," + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="#F0EDE8" width="1" height="1"/></svg>`
  );
}
```

**Примечание:** Для реального blur-up (как на Aesop) нужен пакет `plaiceholder` или `sharp` для генерации blurDataURL из реальных изображений на сервере. Начальная версия может использовать solid-color placeholder (#F0EDE8 — тёплый кремовый, как фон сайта).

### Шаг 2: Добавить imageComponent prop в ProductCard

В `packages/ui/src/components/ProductCard.tsx`:

```tsx
export type ProductCardProps = {
  // ... existing props
  imageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    sizes?: string;
    priority?: boolean;
  }>;
};
```

Внутри компонента:
```tsx
const Img = imageComponent ?? "img";
// Заменить <img src={...} /> на <Img src={...} />
```

### Шаг 3: Аналогично для ProductGallery

Добавить `imageComponent` prop в `ProductGalleryProps`.

**ВАЖНО для zoom viewer:** В zoom mode изображение трансформируется через Framer Motion (`animate={{ x, y, scale }}`). `next/image` с `fill` может конфликтовать с CSS transforms. Для zoom viewer оставить `<img>` — он загружает полноразмерное изображение, оптимизация не нужна.

### Шаг 4: Обновить consumers

В `apps/web/app/home-page-client.tsx` и `apps/web/app/product/[slug]/product-page-client.tsx`:

```tsx
import { OptimizedImage } from "@/components/optimized-image";

<ProductCard imageComponent={OptimizedImage} ... />
<ProductGallery imageComponent={OptimizedImage} ... />
```

### Шаг 5: Настроить next.config

В `apps/web/next.config.mjs` (или `.js`), добавить images config:

```js
images: {
  // Для локальных изображений из public/ не нужно remotePatterns
  // Но если API отдаёт полные URL — добавить:
  // remotePatterns: [{ protocol: "https", hostname: "api.textile.studio" }],
  deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920],
  imageSizes: [96, 128, 256, 384],
  formats: ["image/webp", "image/avif"],
}
```

### Шаг 6: TopNav логотип

`TopNav.tsx` — заменить `<img>` на prop `logoComponent` аналогично. Или, если логотип маленький и статичный, оставить `<img>` с добавлением `loading="eager"` (логотип в header должен загружаться сразу).

## Чеклист для тестирования

- [ ] Homepage: карточки товаров показывают blur → sharp при загрузке
- [ ] Homepage: editorial rail изображения загружаются с placeholder
- [ ] PDP desktop: gallery grid — все изображения с placeholder
- [ ] PDP mobile: active image с placeholder
- [ ] PDP zoom viewer: `<img>` остался (не `<Image>`), zoom/pan работает
- [ ] Нет layout shift (CLS) при загрузке изображений
- [ ] `tsc --noEmit` проходит для обоих пакетов
- [ ] Lighthouse: проверить Performance score (должен вырасти)

## Файлы для изменения

| Файл | Что делать |
|------|-----------|
| `apps/web/components/optimized-image.tsx` | СОЗДАТЬ — wrapper |
| `packages/ui/src/components/ProductCard.tsx` | ИЗМЕНИТЬ — добавить imageComponent prop |
| `packages/ui/src/components/ProductGallery.tsx` | ИЗМЕНИТЬ — добавить imageComponent prop (кроме zoom) |
| `packages/ui/src/components/TopNav.tsx` | ИЗМЕНИТЬ — logoComponent prop или оставить img |
| `apps/web/app/home-page-client.tsx` | ИЗМЕНИТЬ — передать OptimizedImage |
| `apps/web/app/product/[slug]/product-page-client.tsx` | ИЗМЕНИТЬ — передать OptimizedImage |
| `apps/web/next.config.mjs` | ИЗМЕНИТЬ — images config |

## Ограничения

- **НЕ трогать** zoom viewer в ProductGallery — там `<img>` нужен для Framer Motion transforms
- **НЕ трогать** motion/animation код
- **НЕ менять** API типы (`ProductMedia`)
- Все изменения в `packages/ui` должны быть **backwards-compatible** (imageComponent optional, fallback на `<img>`)

## Команды

```bash
# Dev server
make dev

# Typecheck
corepack pnpm --dir packages/ui exec tsc --noEmit
corepack pnpm --dir apps/web exec tsc --noEmit
```
