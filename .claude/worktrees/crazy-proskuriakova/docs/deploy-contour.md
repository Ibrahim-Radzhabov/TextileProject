# Deploy Contour (MVP Storefront)

Updated: 2026-03-04

This runbook is the default rollout contour for production deploys.

## 1. Pre-deploy gate

Run from repo root:

```bash
corepack pnpm --dir apps/web build
corepack pnpm e2e
```

Deploy only if both commands are green.

## 2. Release checkpoint

Create and push a release tag on current `main`:

```bash
git tag -a release-mvp-2026-03-04 -m "MVP storefront checkpoint before deploy"
git push origin release-mvp-2026-03-04
```

## 3. Environment checklist

Set at least:

- `CLIENT_ID=demo` (or your tenant id)
- `FRONTEND_ORIGIN=https://<your-domain>`
- `NEXT_PUBLIC_STORE_API_URL=https://<your-api-domain>`
- `ADMIN_TOKEN=<secure-token>`

Optional integrations:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Template: [`infra/.env.example`](../infra/.env.example)

## 4. Deploy via Docker Compose

```bash
cd infra
docker compose pull
docker compose up -d --build
docker compose ps
```

Expected:

- API healthy (`/health` is `200`)
- Web reachable (`/` is `200`)

## 5. Post-deploy smoke

Run smoke against deployed domains:

```bash
BASE_URL=https://<your-domain> \
API_URL=https://<your-api-domain> \
bash scripts/post-deploy-smoke.sh
```

Or via npm script:

```bash
BASE_URL=https://<your-domain> API_URL=https://<your-api-domain> corepack pnpm deploy:smoke
```

## 6. Rollback (fast)

```bash
git checkout <previous-stable-tag-or-commit>
cd infra
docker compose up -d --build
```

Then run post-deploy smoke again.
