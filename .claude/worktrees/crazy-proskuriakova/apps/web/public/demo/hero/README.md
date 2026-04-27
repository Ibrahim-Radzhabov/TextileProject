Hero media placeholders

Drop production media assets in this directory and wire them in `clients/demo/pages.json`.

Suggested file names:
- `textile-loop-desktop.webm` (desktop loop)
- `textile-loop-mobile.webm` (mobile crop)
- `textile-loop-poster.svg` (fallback poster)

Generate local placeholder loops from textile art:

```bash
corepack pnpm media:hero-loop
```

Current config uses local files from this folder.
