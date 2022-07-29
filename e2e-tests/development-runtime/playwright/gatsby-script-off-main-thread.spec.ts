import { test, expect } from "@playwright/test"

const id = {
  // Acutual <Script>
  three: `three`,

  // DOM nodes appended as a result of `<Script>` execution
  templateLiteral: `mutation-inline-script-template-literal`,
  dangerouslySet: `mutation-inline-script-dangerously-set`,
  scriptWithSrc: `mutation-script-with-src`,
}

test.describe(`off-main-thread scripts`, () => {
  test(`should load successfully when the page is visited directly`, async ({
    page,
  }) => {
    await page.goto(`/gatsby-script-off-main-thread/`)
    await page.evaluate(
      () => location.pathname === `/gatsby-script-off-main-thread/`
    )

    const partytownSnippet = page.locator(`[data-partytown]`)
    const scriptWithSrc = page.locator(`[id=${id.three}]`)
    const templateLiteral = page.locator(`[id=${id.templateLiteral}]`)
    const dangerouslySet = page.locator(`[id=${id.dangerouslySet}]`)

    await expect(partytownSnippet).toContainText(/THREE/) // Forwards configured
    await expect(templateLiteral).toHaveText(`${id.templateLiteral}: success`) // Template literal inline scripts loaded
    await expect(dangerouslySet).toHaveText(`${id.dangerouslySet}: success`) // Dangerously set inline scripts loaded
    await expect(scriptWithSrc).toHaveAttribute(`type`, `text/partytown-x`) // Scripts with sources loaded
  })

  test(`should load successfully when navigating via Gatsby Link to a page with off-main-thread scripts`, async ({
    page,
  }) => {
    await page.goto(`/`)
    await page.evaluate(() => location.pathname === `/`)

    await page.locator(`[data-testid=off-main-thread]`).click()
    await page.evaluate(
      () => location.pathname === `/gatsby-script-off-main-thread/`
    )

    const partytownSnippet = page.locator(`[data-partytown]`)
    const scriptWithSrc = page.locator(`[id=${id.three}]`)
    const templateLiteral = page.locator(`[id=${id.templateLiteral}]`)
    const dangerouslySet = page.locator(`[id=${id.dangerouslySet}]`)

    await expect(partytownSnippet).toContainText(/THREE/) // Forwards configured
    await expect(templateLiteral).toHaveText(`${id.templateLiteral}: success`) // Template literal inline scripts loaded
    await expect(dangerouslySet).toHaveText(`${id.dangerouslySet}: success`) // Dangerously set inline scripts loaded
    await expect(scriptWithSrc).toHaveAttribute(`type`, `text/partytown-x`) // Scripts with sources loaded, use `type` attr Partytown mutates on success as proxy
  })

  test(`should load successfully when navigating via Gatsby Link between pages with off-main-thread scripts`, async ({
    page,
  }) => {
    await page.goto(`/gatsby-script-off-main-thread/`)
    await page.evaluate(
      () => location.pathname === `/gatsby-script-off-main-thread/`
    )

    await page.locator(`[data-testid=off-main-thread-2]`).click()
    await page.evaluate(
      () => location.pathname === `/gatsby-script-off-main-thread-2/`
    )

    const partytownSnippet = page.locator(`[data-partytown]`)
    const scriptWithSrc = page.locator(`[id=${id.scriptWithSrc}]`)
    const templateLiteral = page.locator(`[id=${id.templateLiteral}-2]`)
    const dangerouslySet = page.locator(`[id=${id.dangerouslySet}-2]`)

    await expect(partytownSnippet).toContainText(/some-other-forward/) // Forwards configured
    await expect(templateLiteral).toHaveText(`${id.templateLiteral}-2: success`) // Template literal inline scripts loaded
    await expect(dangerouslySet).toHaveText(`${id.dangerouslySet}-2: success`) // Dangerously set inline scripts loaded
    await expect(scriptWithSrc).toHaveText(`${id.scriptWithSrc}: success`) // Scripts with sources loaded
  })
})
