import { test, expect } from "@playwright/test"

const id = {
  templateLiteral: `inline-script-template-literal-mutation`,
  dangerouslySet: `inline-script-dangerously-set-mutation`,
}

test.describe(`off-main-thread scripts`, () => {
  test(`should load successfully`, async ({ page }) => {
    await page.goto(`/gatsby-script-off-main-thread/`)

    // @ts-ignore
    const scriptWithSrc = await page.evaluate(() => typeof THREE === `function`)

    const templateLiteral = await page
      .locator(`[id=${id.templateLiteral}]`)
      .textContent()

    const dangerouslySet = await page
      .locator(`[id=${id.dangerouslySet}]`)
      .textContent()

    await expect(scriptWithSrc).toBeTruthy()
    await expect(templateLiteral).toEqual(`${id.templateLiteral}: success`)
    await expect(dangerouslySet).toEqual(`${id.dangerouslySet}: success`)
  })
})
