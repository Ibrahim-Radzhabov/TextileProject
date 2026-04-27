import path from "node:path";
import { promises as fs } from "node:fs";
import { chromium } from "@playwright/test";

const rootDir = process.cwd();
const heroDir = path.join(rootDir, "apps/web/public/demo/hero");
const sourceImagePath = path.join(rootDir, "apps/web/public/demo/ripple-fold-sheer.svg");
const posterPath = path.join(heroDir, "textile-loop-poster.svg");
const tempVideoDir = path.join("/tmp", "store-platform-hero-loop");

const loops = [
  {
    name: "desktop",
    viewport: { width: 1280, height: 720 },
    translateX: "-1.8%",
    translateY: "-1.2%"
  },
  {
    name: "mobile",
    viewport: { width: 720, height: 1280 },
    translateX: "-2.2%",
    translateY: "-2.4%"
  }
];

function buildTemplate(dataUrl, translateX, translateY) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <style>
      :root {
        color-scheme: only light;
      }
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #efeae3;
      }
      .stage {
        position: fixed;
        inset: -8%;
        background-image: url("${dataUrl}");
        background-size: cover;
        background-position: center center;
        animation: textile-pan 8s ease-in-out infinite;
        transform-origin: center center;
      }
      .soft-light {
        position: fixed;
        inset: 0;
        background:
          radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.28), transparent 46%),
          radial-gradient(circle at 82% 20%, rgba(255, 255, 255, 0.17), transparent 54%),
          linear-gradient(180deg, rgba(243, 240, 236, 0.24), rgba(243, 240, 236, 0.08));
      }
      @keyframes textile-pan {
        0% {
          transform: scale(1.03) translate3d(0, 0, 0);
        }
        50% {
          transform: scale(1.08) translate3d(${translateX}, ${translateY}, 0);
        }
        100% {
          transform: scale(1.03) translate3d(0, 0, 0);
        }
      }
    </style>
  </head>
  <body>
    <div class="stage"></div>
    <div class="soft-light"></div>
  </body>
</html>`;
}

async function captureLoop(browser, name, viewport, dataUrl, translateX, translateY) {
  const targetPath = path.join(heroDir, `textile-loop-${name}.webm`);
  const recordDir = path.join(tempVideoDir, name);

  await fs.rm(recordDir, { recursive: true, force: true });
  await fs.mkdir(recordDir, { recursive: true });

  const context = await browser.newContext({
    viewport,
    recordVideo: {
      dir: recordDir,
      size: viewport
    }
  });

  const page = await context.newPage();
  await page.setContent(buildTemplate(dataUrl, translateX, translateY), {
    waitUntil: "domcontentloaded"
  });

  await page.waitForTimeout(8200);
  await context.close();

  const files = await fs.readdir(recordDir);
  const videoFile = files.find((file) => file.endsWith(".webm"));

  if (!videoFile) {
    throw new Error(`Loop "${name}" was not recorded.`);
  }

  await fs.rm(targetPath, { force: true });
  await fs.rename(path.join(recordDir, videoFile), targetPath);
}

async function main() {
  await fs.mkdir(heroDir, { recursive: true });
  await fs.mkdir(tempVideoDir, { recursive: true });

  const sourceImage = await fs.readFile(sourceImagePath, "utf8");
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(sourceImage).toString("base64")}`;

  const browser = await chromium.launch({ headless: true });

  try {
    for (const loop of loops) {
      await captureLoop(
        browser,
        loop.name,
        loop.viewport,
        dataUrl,
        loop.translateX,
        loop.translateY
      );
    }
  } finally {
    await browser.close();
  }

  await fs.copyFile(sourceImagePath, posterPath);

  console.log("Generated hero loops:");
  console.log(path.join(heroDir, "textile-loop-desktop.webm"));
  console.log(path.join(heroDir, "textile-loop-mobile.webm"));
  console.log(path.join(heroDir, "textile-loop-poster.svg"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
