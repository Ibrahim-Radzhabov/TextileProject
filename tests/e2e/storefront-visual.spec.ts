import { expect, test, type Locator, type Page } from "@playwright/test";

type VisualRoute = {
  id: "home" | "catalog" | "product";
  path: string;
  readyLocator: (page: Page) => Locator;
};

type VisualViewport = {
  id: string;
  width: number;
  height: number;
};

const VISUAL_VIEWPORTS: VisualViewport[] = [
  { id: "390x844", width: 390, height: 844 },
  { id: "768x1024", width: 768, height: 1024 },
  { id: "1280x900", width: 1280, height: 900 }
];

const VISUAL_ROUTES: VisualRoute[] = [
  {
    id: "home",
    path: "/",
    readyLocator: (page) => page.locator("main h1").first()
  },
  {
    id: "catalog",
    path: "/catalog",
    readyLocator: (page) => page.getByRole("heading", { name: "Каталог" })
  },
  {
    id: "product",
    path: "/product/ripple-fold-sheer",
    readyLocator: (page) => page.locator("main h1").first()
  }
];

function isExpectedMediaAbortError(message: string): boolean {
  return (
    message.includes("Failed to load resource: net::ERR_FAILED") ||
    message.includes("Failed to load resource: net::ERR_ABORTED")
  );
}

for (const viewport of VISUAL_VIEWPORTS) {
  test.describe(`@visual storefront snapshots ${viewport.id}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of VISUAL_ROUTES) {
      test(`${route.id} matches baseline`, async ({ page }) => {
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];

        page.on("console", (entry) => {
          if (entry.type() === "error") {
            const message = entry.text();
            if (!isExpectedMediaAbortError(message)) {
              consoleErrors.push(message);
            }
          }
        });
        page.on("pageerror", (error) => {
          pageErrors.push(String(error));
        });

        await page.route(/\.(mp4|webm|mov)(\?.*)?$/i, async (request) => {
          await request.abort();
        });

        const response = await page.goto(route.path, { waitUntil: "networkidle" });
        expect(response?.status(), `${route.path} should return < 400`).toBeLessThan(400);
        await expect(route.readyLocator(page)).toBeVisible();

        await page.waitForTimeout(250);

        await expect(page).toHaveScreenshot(`${route.id}-${viewport.id}.png`, {
          animations: "disabled",
          caret: "hide",
          maxDiffPixelRatio: 0.025
        });

        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);
      });
    }
  });
}
