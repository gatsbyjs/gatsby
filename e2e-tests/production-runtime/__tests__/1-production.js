// TODO: put this in .eslintrc or equivalent
/* globals page */

// TODO: move the following functions to some shared context (e.g. plugin)

async function initAPIHandler() {
  await page.evaluate(() => {
    if (
      typeof window.___apiHandler === `function` &&
      typeof window.___waitForAPI === `function`
    ) {
      return
    }

    let resolve = null
    let awaitingAPI = null

    window.___apiHandler = api => {
      if (!awaitingAPI) {
        // If we're not currently waiting for anything,
        // mark the API as pre-resolved.
        window.___resolvedAPIs.push(api)
      } else if (api === awaitingAPI) {
        // If we've been waiting for something, now it's time to resolve it.
        awaitingAPI = null
        window.___resolvedAPIs = []
        resolve()
      }
    }

    window.___waitForAPI = api => {
      const promise = new Promise(r => {
        resolve = r
      })
      awaitingAPI = api

      if (window.___resolvedAPIs && window.___resolvedAPIs.includes(api)) {
        // If the API has been marked as pre-resolved,
        // resolve immediately and reset the variables.
        awaitingAPI = null
        window.___resolvedAPIs = []
        resolve()
      }
      return promise
    }
  })
}

async function waitForAPI(api) {
  await initAPIHandler()
  return await page.evaluate(api => window.___waitForAPI(api), api)
}

async function getTestElement(selector) {
  return await page.$(`[data-testid="${selector}"]`)
}

async function click(elementHandle) {
  return await elementHandle.click()
}

async function html(elementHandle) {
  return await page.evaluate(element => element.innerHTML, elementHandle)
}

const ORIGIN = `http://localhost:9000`

async function goto(path) {
  return await page.goto(ORIGIN + path)
}

function path() {
  return page.url().replace(ORIGIN, ``)
}

describe(`Production build tests`, () => {
  jest.setTimeout(5 * 60 * 60 * 1000)

  it(`should render properly`, async () => {
    await goto(`/`)
    await waitForAPI(`onRouteUpdate`)
  })

  it(`should navigate back after a reload`, async () => {
    await click(await getTestElement(`page2`))
    await waitForAPI(`onRouteUpdate`)
    expect(path()).toBe(`/page-2/`)

    await page.reload()
    await waitForAPI(`onRouteUpdate`)
    await page.goBack()
    await waitForAPI(`onRouteUpdate`)

    expect(await getTestElement(`page2`)).toBeDefined()
    expect(path()).toBe(`/`)
  })

  it(`should work when visiting a page with direct URL entry or an external link`, async () => {
    await goto(`/page-2/`)
    await waitForAPI(`onRouteUpdate`)
    expect(await getTestElement(`index-link`)).toBeDefined()
    expect(path()).toBe(`/page-2/`)
  })

  it(`should show 404 page when clicking a link to a non-existent page route`, async () => {
    await goto(`/`)
    await waitForAPI(`onRouteUpdate`)

    await click(await getTestElement(`404`))
    await waitForAPI(`onRouteUpdate`)

    expect(path()).toBe(`/page-3/`)
    expect(await getTestElement(`404`)).toBeDefined()
  })

  it(`should show 404 page when directly entering an invalid URL`, async () => {
    await goto(`/non-existent-page/`)
    await waitForAPI(`onRouteUpdate`)

    expect(await getTestElement(`404`)).toBeDefined()
  })

  it(`should navigate back after a 404 from a direct link entry`, async () => {
    await goto(`/`)
    await waitForAPI(`onRouteUpdate`)

    await goto(`/non-existent-page/`)
    await waitForAPI(`onRouteUpdate`)

    await page.goBack()
    await waitForAPI(`onRouteUpdate`)
    expect(await getTestElement(`index-link`)).toBeDefined()
  })

  it(`should pass pathContext to props`, async () => {
    await goto(`/path-context`)
    await waitForAPI(`onRouteUpdate`)

    // `bar` is set in gatsby-node createPages
    expect(await html(await getTestElement(`path-context-foo`))).toContain(
      `bar`
    )
  })

  it(`Uses env vars`, async () => {
    await goto(`/env-vars`)
    await waitForAPI(`onRouteUpdate`)

    expect(await html(await getTestElement(`process.env`))).toContain(`{}`)
    expect(
      await html(await getTestElement(`process.env.EXISTING_VAR`))
    ).toContain(`foo bar`)
    expect(
      await html(await getTestElement(`process.env.NOT_EXISTING_VAR`))
    ).toBe(``)
  })

  describe(`Supports unicode characters in urls`, () => {
    // it(`Can navigate directly`, () => {
    //   cy.visit(`/안녕/`, {
    //     // Cypress seems to think it's 404
    //     // even if it's not. 404 page doesn't have
    //     // `page-2-message` element so the test will fail on
    //     // assertion. Using failOnStatusCode here
    //     // only to workaround cypress weirdness
    //     failOnStatusCode: false,
    //   }).waitForRouteChange()
    //   cy.getTestElement(`page-2-message`)
    //     .invoke(`text`)
    //     .should(`equal`, `Hi from the second page`)
    // })
    // it(`Can navigate on client`, () => {
    //   cy.visit(`/`).waitForRouteChange()
    //   cy.getTestElement(`page-with-unicode-path`)
    //     .click()
    //     .waitForRouteChange()
    //   cy.getTestElement(`page-2-message`)
    //     .invoke(`text`)
    //     .should(`equal`, `Hi from the second page`)
    // })
  })
})
