import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const urls = [
  'http://127.0.0.1:3000/product/linen-blackout-drape',
  'http://127.0.0.1:3000/product/tyul-batist'
];
for (const url of urls) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('button[aria-label^="Открыть изображение"]').first().click({ force: true });
  const dialog = page.locator('[role="dialog"]').last();
  await dialog.waitFor({ state: 'visible' });
  const metrics = await dialog.evaluate((node) => {
    const stage = node.querySelector('div.overflow-auto');
    const img = stage?.querySelector('img');
    if (!(stage instanceof HTMLElement) || !(img instanceof HTMLImageElement)) {
      return { found: false };
    }
    const beforeTop = img.getBoundingClientRect().top;
    const beforeLeft = img.getBoundingClientRect().left;
    const maxTop = Math.max(0, stage.scrollHeight - stage.clientHeight);
    const maxLeft = Math.max(0, stage.scrollWidth - stage.clientWidth);
    stage.scrollTop = Math.min(400, maxTop);
    stage.scrollLeft = Math.min(120, maxLeft);
    const afterTop = img.getBoundingClientRect().top;
    const afterLeft = img.getBoundingClientRect().left;
    return {
      found: true,
      before: {
        scrollTop: 0,
        scrollLeft: 0,
        imgTop: beforeTop,
        imgLeft: beforeLeft,
        scrollHeight: stage.scrollHeight,
        clientHeight: stage.clientHeight,
        scrollWidth: stage.scrollWidth,
        clientWidth: stage.clientWidth,
      },
      after: {
        scrollTop: stage.scrollTop,
        scrollLeft: stage.scrollLeft,
        imgTop: afterTop,
        imgLeft: afterLeft,
      }
    };
  });
  console.log(JSON.stringify({ url, metrics }, null, 2));
  await page.keyboard.press('Escape');
}
await browser.close();
