#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const host = "127.0.0.1";
const apiPort = Number(process.env.SMOKE_API_PORT ?? "8100");
const webPort = Number(process.env.SMOKE_WEB_PORT ?? "3300");
const baseUrl = `http://${host}:${webPort}`;
const apiUrl = `http://${host}:${apiPort}`;
const artifactDir = process.env.SMOKE_ARTIFACT_DIR ?? "artifacts/storefront-smoke";
const shouldSkipBuild = process.env.SMOKE_SKIP_BUILD === "1";

const routeChecks = [
  { path: "/", expectedStatus: 200 },
  { path: "/catalog", expectedStatus: 200 },
  { path: "/product/ripple-fold-sheer", expectedStatus: 200 },
  { path: "/checkout", expectedStatus: 200 },
  { path: "/checkout/success", expectedStatus: 200 },
  { path: "/order-status", expectedStatus: 404 }
];

const viewportChecks = [
  { name: "v390", width: 390, height: 844 },
  { name: "v768", width: 768, height: 1024 },
  { name: "v1024", width: 1024, height: 900 },
  { name: "v1280", width: 1280, height: 900 }
];

const viewportPages = [
  { name: "home", path: "/" },
  { name: "catalog", path: "/catalog" },
  { name: "product", path: "/product/ripple-fold-sheer" },
  { name: "checkout", path: "/checkout" }
];

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${String(code)}`));
    });
  });
}

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    ...options
  });
  return child;
}

async function waitForStatus(url, expectedStatuses, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (expectedStatuses.includes(response.status)) {
        return response.status;
      }
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function stopProcess(child, name) {
  if (!child || child.killed) {
    return;
  }

  const isRunning = child.exitCode === null;
  if (!isRunning) {
    return;
  }

  child.kill("SIGTERM");
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
      }
      resolve();
    }, 5000);

    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  console.log(`[smoke] stopped ${name}`);
}

async function runViewportQa() {
  mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of viewportChecks) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });

      for (const pageSpec of viewportPages) {
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];

        page.on("console", (entry) => {
          if (entry.type() === "error") {
            consoleErrors.push(entry.text());
          }
        });
        page.on("pageerror", (entry) => {
          pageErrors.push(String(entry));
        });

        const response = await page.goto(`${baseUrl}${pageSpec.path}`, {
          waitUntil: "networkidle",
          timeout: 60000
        });
        await page.waitForTimeout(300);

        const metrics = await page.evaluate(() => {
          const html = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(html.scrollWidth, body ? body.scrollWidth : 0);
          const clientWidth = html.clientWidth;
          return {
            overflowX: scrollWidth > clientWidth + 1
          };
        });

        const screenshotPath = join(artifactDir, `${viewport.name}-${pageSpec.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        results.push({
          viewport: viewport.name,
          path: pageSpec.path,
          status: response ? response.status() : -1,
          overflowX: metrics.overflowX,
          consoleErrors,
          pageErrors
        });

        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const reportPath = join(artifactDir, "report.json");
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`[smoke] viewport report: ${reportPath}`);

  for (const row of results) {
    console.log(
      `[smoke][viewport] ${row.viewport} ${row.path} status=${row.status} overflowX=${String(
        row.overflowX
      )} consoleErr=${String(row.consoleErrors.length)} pageErr=${String(row.pageErrors.length)}`
    );
  }

  const failing = results.filter(
    (row) =>
      row.status >= 400 ||
      row.overflowX ||
      row.consoleErrors.length > 0 ||
      row.pageErrors.length > 0
  );
  if (failing.length > 0) {
    throw new Error("Viewport QA failed. See artifacts/storefront-smoke/report.json");
  }
}

async function main() {
  let apiProcess;
  let webProcess;

  try {
    if (!shouldSkipBuild) {
      console.log("[smoke] running build");
      await runCommand("corepack", ["pnpm", "build"]);
    } else {
      console.log("[smoke] skipping build (SMOKE_SKIP_BUILD=1)");
    }

    console.log("[smoke] starting API");
    apiProcess = startProcess(".venv/bin/uvicorn", [
      "apps.api.main:app",
      "--host",
      host,
      "--port",
      String(apiPort)
    ]);
    await waitForStatus(`${apiUrl}/storefront/config?client_id=demo`, [200], 60000);

    console.log("[smoke] starting web");
    const webEnv = {
      ...process.env,
      CLIENT_ID: "demo",
      STORE_API_URL: apiUrl,
      NEXT_PUBLIC_STORE_API_URL: apiUrl,
      ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? "admin123",
      HOSTNAME: host,
      PORT: String(webPort)
    };

    webProcess = startProcess(
      "corepack",
      ["pnpm", "--filter", "web", "start", "--hostname", host, "--port", String(webPort)],
      { env: webEnv }
    );
    await waitForStatus(`${baseUrl}/`, [200], 90000);

    for (const route of routeChecks) {
      const status = await waitForStatus(
        `${baseUrl}${route.path}`,
        [route.expectedStatus],
        30000
      );
      console.log(
        `[smoke][route] ${route.path} -> ${String(status)} (expected ${String(route.expectedStatus)})`
      );
    }

    await runViewportQa();
    console.log("[smoke] PASS");
  } finally {
    await stopProcess(webProcess, "web");
    await stopProcess(apiProcess, "api");
  }
}

main().catch((error) => {
  console.error("[smoke] FAIL");
  console.error(error);
  process.exit(1);
});
