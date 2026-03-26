import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.goto('http://127.0.0.1:3000/product/tyul-batist', { waitUntil: 'networkidle' });
await page.locator('button[aria-label^="Открыть изображение"]').first().click({ force: true });
const dialog = page.locator('[role="dialog"]').last();
await dialog.waitFor({ state: 'visible' });
const data = await dialog.evaluate((node) => {
  return Array.from(node.querySelectorAll('div')).slice(0, 20).map((el) => ({ className: el.className, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
