import { defineConfig } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";
const API_URL = "http://127.0.0.1:8000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  globalSetup: "./tests/e2e/global-setup.ts",
  webServer: [
    {
      command:
        "CLIENT_ID=demo FRONTEND_ORIGIN=http://127.0.0.1:3000 STRIPE_WEBHOOK_SECRET=whsec_e2e_test ORDER_DB_PATH=/tmp/store-platform-e2e.sqlite3 .venv/bin/uvicorn apps.api.main:app --host 127.0.0.1 --port 8000",
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI
    },
    {
      command:
        "STORE_API_URL=http://127.0.0.1:8000 NEXT_PUBLIC_STORE_API_URL=http://127.0.0.1:8000 ADMIN_TOKEN=e2e-admin corepack pnpm --dir apps/web build && STORE_API_URL=http://127.0.0.1:8000 NEXT_PUBLIC_STORE_API_URL=http://127.0.0.1:8000 ADMIN_TOKEN=e2e-admin HOSTNAME=127.0.0.1 PORT=3000 node apps/web/.next/standalone/apps/web/server.js",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI
    }
  ]
});
