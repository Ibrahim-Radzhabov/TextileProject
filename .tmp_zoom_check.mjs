import { chromium } from '@playwright/test';

const urls = [
  'http://127.0.0.1:3000/product/linen-blackout-drape',
  'http://127.0.0.1:3000/product/tyul-batist'
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

for (const url of urls) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('button[aria-label^="Открыть изображение"]').first().click();
  const dialog = page.getByRole('dialog', { name: 'Просмотр изображений товара' });
  await dialog.waitFor({ state: 'visible' });

  const metrics = await dialog.evaluate((node) => {
    const stage = node.querySelector('div.overflow-auto');
    const img = stage?.querySelector('img');
    if (!(stage instanceof HTMLElement) || !(img instanceof HTMLImageElement)) {
      return { found: false };
    }
    const before = {
      scrollTop: stage.scrollTop,
      scrollLeft: stage.scrollLeft,
      scrollHeight: stage.scrollHeight,
      clientHeight: stage.clientHeight,
      scrollWidth: stage.scrollWidth,
      clientWidth: stage.clientWidth,
      imgTop: img.getBoundingClientRect().top,
      imgBottom: img.getBoundingClientRect().bottom,
    };
    stage.scrollTop = Math.min(400, Math.max(0, stage.scrollHeight - stage.clientHeight));
    stage.scrollLeft = Math.min(200, Math.max(0, stage.scrollWidth - stage.clientWidth));
    const after = {
      scrollTop: stage.scrollTop,
      scrollLeft: stage.scrollLeft,
      imgTop: img.getBoundingClientRect().top,
      imgBottom: img.getBoundingClientRect().bottom,
    };
    return { found: true, before, after };
  });

  console.log(JSON.stringify({ url, metrics }, null, 2));
  await page.keyboard.press('Escape');
}

await browser.close();
