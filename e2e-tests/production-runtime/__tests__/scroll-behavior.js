const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })
const sleep = require(`./lib/sleep`)

describe(`Scroll behaviour`, () => {
  it(`should restore scroll position only when going back in history`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`long-page`)
    await g.waitForAPI(`onRouteUpdate`)

    // allow ScrollContext to update scroll position store
    // it uses requestAnimationFrame so wait a bit to allow
    // it to store scroll position
    await sleep(100)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    await g.click(`below-the-fold`)
    await g.waitForAPI(`onRouteUpdate`)

    // after going back we expect page will
    // be restore previous scroll position
    await page.goBack()
    await g.waitForAPI(`onRouteUpdate`)
    expect(await page.evaluate(() => window.scrollY)).not.toBe(0)

    await page.goForward()
    await g.waitForAPI(`onRouteUpdate`)

    // after clicking link we expect page will be scrolled to top
    await g.click(`long-page`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    // reset to index page
    await g.click(`index-link`)
    await g.waitForAPI(`onRouteUpdate`)
  })

  it(`should keep track of location.key`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`long-page`)
    await g.waitForAPI(`onRouteUpdate`)

    const scrollPos = []

    await sleep(100)
    await g.scrollTo(`below-the-fold`)
    scrollPos[0] = await page.evaluate(() => window.scrollY)
    await g.click(`below-the-fold`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`long-page`)
    await g.waitForAPI(`onRouteUpdate`)

    await sleep(100)
    await g.scrollTo(`even-more-below-the-fold`)
    scrollPos[1] = await page.evaluate(() => window.scrollY)
    await g.click(`even-more-below-the-fold`)
    await g.waitForAPI(`onRouteUpdate`)

    await page.goBack()
    await g.waitForAPI(`onRouteUpdate`)

    expect(g.path()).toBe(`/long-page/`)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollPos[1])
    expect(await page.evaluate(() => window.scrollY)).not.toBe(scrollPos[0])

    await page.goBack()
    await g.waitForAPI(`onRouteUpdate`)
    await page.goBack()
    await g.waitForAPI(`onRouteUpdate`)

    expect(g.path()).toBe(`/long-page/`)
    // we went back in hitsory 2 more times, so we should end up in the middle of the page
    // instead of at the bottom
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollPos[0])
    expect(await page.evaluate(() => window.scrollY)).not.toBe(scrollPos[1])
  })
})
