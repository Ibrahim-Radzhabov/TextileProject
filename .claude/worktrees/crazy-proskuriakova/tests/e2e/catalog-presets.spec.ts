import { expect, test, type Page } from "@playwright/test";

type PresetCase = {
  view: "room" | "light" | "texture" | "kits";
  label: string;
};

const presetCases: PresetCase[] = [
  { view: "room", label: "По комнате" },
  { view: "light", label: "По светопропусканию" },
  { view: "texture", label: "По фактуре" },
  { view: "kits", label: "Готовые наборы" }
];

async function readBadgeCount(page: Page, label: RegExp): Promise<number> {
  const text = await page.getByText(label).first().innerText();
  const match = text.match(/(\d+)/);
  if (!match) {
    throw new Error(`Unable to parse count from "${text}"`);
  }
  return Number(match[1]);
}

for (const presetCase of presetCases) {
  test(`catalog preset view=${presetCase.view} applies and resets`, async ({ page }) => {
    await page.goto(`/catalog?view=${presetCase.view}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Каталог" })).toBeVisible();

    const banner = page.getByTestId("catalog-preset-banner");
    await expect(banner).toBeVisible();
    await expect(page.getByTestId(`catalog-preset-${presetCase.view}`)).toContainText(
      presetCase.label
    );

    const shownCount = await readBadgeCount(page, /Показано:\s*\d+/);
    const selectedFilters = await readBadgeCount(page, /Фильтры:\s*\d+/);

    expect(shownCount).toBeGreaterThan(0);
    expect(selectedFilters).toBeGreaterThan(0);

    await page.getByTestId("catalog-preset-clear").click();
    await expect(page).not.toHaveURL(/view=/);
    await expect(page.getByTestId("catalog-preset-banner")).toHaveCount(0);
  });
}
