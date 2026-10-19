// e2e/a11y.spec.ts : audit axe sur les pages qui comptent
// Prérequis : npm i -D @playwright/test @axe-core/playwright
// et un playwright.config.ts avec webServer qui lance "npm run start" (voir l'article).

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Listez ici les pages que vous ne voulez jamais casser.
const PAGES = ["/", "/contact", "/connexion"];

for (const path of PAGES) {
  test(`accessibilité : ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Message lisible en cas d'échec : règle, impact, nombre d'éléments
    const resume = results.violations.map(
      (v) => `${v.id} (${v.impact}) : ${v.nodes.length} élément(s), ${v.helpUrl}`
    );
    expect(resume, resume.join("\n")).toEqual([]);
  });
}

// Le clavier, qu'axe ne teste pas : le premier Tab doit atteindre un élément visible.
test("clavier : le premier Tab atteint un élément visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
});
