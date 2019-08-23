const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })
const { overwriteWebpackCompilationHash } = require(`./lib/compilation-hash`)

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function createMockCompilationHash() {
  return new Array(20)
    .map(a => getRandomInt(0, 16))
    .map(k => k.toString(16))
    .join(``)
}

describe(`Webpack Compilation Hash tests`, () => {
  it(`should render properly`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)
  })

  // This covers the case where a user loads a gatsby site and then
  // the site is changed resulting in a webpack recompile and a
  // redeploy. This could result in a mismatch between the page-data
  // and the component. To protect against this, when gatsby loads a
  // new page-data.json, it refreshes the page if it's webpack
  // compilation hash differs from the one on on the window object
  // (which was set on initial page load)
  //
  // Since initial page load results in all links being prefetched, we
  // have to navigate to a non-prefetched page to test this. Thus the
  // `deep-link-page`.
  //
  // We simulate a rebuild by updating all page-data.jsons and page
  // htmls with the new hash. It's not pretty, but it's easier than
  // figuring out how to perform an actual rebuild while cypress is
  // running. See ../plugins/compilation-hash.js for the
  // implementation
  it(`should reload page if build occurs in background`, async () => {
    const oldHash = await g.compilationHash()
    expect(oldHash).toBeDefined()

    // Simulate a new webpack build
    const mockHash = createMockCompilationHash()
    overwriteWebpackCompilationHash(mockHash)

    await g.click(`compilation-hash`)
    await g.waitForAPI(`onRouteUpdate`)

    // Navigate into a non-prefetched page
    try {
      // The page should reload about here which can cause
      // the click to fail the first time
      await g.click(`deep-link-page`)
    } catch {
      await g.waitForAPI(`onRouteUpdate`)
      await g.click(`deep-link-page`)
    }
    await g.waitForAPI(`onRouteUpdate`)

    // If the window compilation hash has changed, we know the
    // page was refreshed
    expect(await g.compilationHash()).toBe(mockHash)

    // Cleanup
    await overwriteWebpackCompilationHash(oldHash)
  })
})
