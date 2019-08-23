const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })
const {
  restoreAllBlockedResources,
  blockAssetsForChunk,
  blockAssetsForPage,
} = require(`./lib/block-resources`)

const ROUTE_UPDATE_TIMEOUT = 500

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitOrSleep(canFail) {
  if (canFail) {
    await Promise.race([
      g.waitForAPI(`onRouteUpdate`).catch(() => sleep(ROUTE_UPDATE_TIMEOUT)),
      sleep(ROUTE_UPDATE_TIMEOUT),
    ])
  } else {
    await g.waitForAPI(`onRouteUpdate`)
  }
}

function runTests(canFail) {
  it(`Loads index`, async () => {
    await g.goto(`/`)
    await waitOrSleep(canFail)
    expect(await g.text(`dom-marker`)).toBe(`index`)
  })

  it(`Navigates to second page`, async () => {
    await g.click(`page2`)
    await waitOrSleep(canFail)
    expect(g.path()).toBe(`/page-2/`)
    expect(await g.text(`dom-marker`)).toBe(`page-2`)
  })

  it(`Navigates to 404 page`, async () => {
    await g.click(`404`)
    await waitOrSleep(canFail)
    expect(g.path()).toBe(`/page-3/`)
    expect(await g.text(`dom-marker`)).toBe(`404`)
  })

  it(`Loads 404`, async () => {
    await g.goto(`/page-3/`)
    await waitOrSleep(canFail)
    expect(await g.text(`dom-marker`)).toBe(`404`)
  })

  it(`Can navigate from 404 to index`, async () => {
    await g.click(`index`)
    await waitOrSleep(canFail)
    expect(g.path()).toBe(`/`)
    expect(await g.text(`dom-marker`)).toBe(`index`)
  })
}

describe(`Every resources available`, () => {
  runTests(false)
})

function runBlockedScenario(task, args) {
  it(`Blocks resources`, () => {
    task(args)
  })
  runTests(true)
  it(`Restores resources`, () => {
    restoreAllBlockedResources()
  })
}

describe(`Missing top level resources`, () => {
  describe(`Deleted app chunk assets`, () => {
    runBlockedScenario(blockAssetsForChunk, { chunk: `app` })
  })
})

const runSuiteForPage = (label, pagePath) => {
  describe(`Missing "${label}" resources`, () => {
    describe(`Missing "${label}" page query results`, () => {
      runBlockedScenario(blockAssetsForPage, {
        pagePath,
        filter: `page-data`,
      })
    })
    describe(`Missing "${label}" page page-template asset`, () => {
      runBlockedScenario(blockAssetsForPage, {
        pagePath,
        filter: `page-template`,
      })
    })
    describe(`Missing "${label}" page extra assets`, () => {
      runBlockedScenario(blockAssetsForPage, {
        pagePath,
        filter: `extra`,
      })
    })
    describe(`Missing all "${label}" page assets`, () => {
      runBlockedScenario(blockAssetsForPage, {
        pagePath,
        filter: `all`,
      })
    })
  })
}

runSuiteForPage(`Index`, `/`)
runSuiteForPage(`Page-2`, `/page-2/`)
runSuiteForPage(`404`, `/404.html`)
