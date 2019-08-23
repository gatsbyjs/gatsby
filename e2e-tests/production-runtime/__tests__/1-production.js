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

function goto(path) {
  return page.goto(`http://localhost:9000${path}`)
}

async function waitForAPI(api) {
  initAPIHandler()
  return await page.evaluate(api => window.___waitForAPI(api), api)
}

describe(`Production build tests`, () => {
  jest.setTimeout(5 * 60 * 60 * 1000)

  it(`should render properly`, async () => {
    await goto(`/`)
    await waitForAPI(`onRouteUpdate`)
  })
})
