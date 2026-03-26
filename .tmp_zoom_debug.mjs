import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const url = 'http://127.0.0.1:3000/product/tyul-batist';
await page.goto(url, { waitUntil: 'networkidle' });
const buttons = page.locator('button[aria-label^="Открыть изображение"]');
console.log('button_count', await buttons.count());
if (await buttons.count()) {
  console.log('first_visible', await buttons.first().isVisible());
  await buttons.first().click({ force: true });
  await page.waitForTimeout(1200);
  console.log('dialog_count', await page.locator('[role="dialog"]').count());
  const html = await page.locator('body').innerHTML();
  console.log('has_dialog_text', html.includes('Просмотр изображений товара'));
}
await browser.close();
