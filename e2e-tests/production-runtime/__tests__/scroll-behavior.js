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
    await sleep(100)

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

    // cy.getTestElement(`below-the-fold`)
    //   .scrollIntoView({
    //     // this is weird hack - seems like Cypress in run mode doesn't update scroll correctly
    //     duration: 100,
    //   })
    //   .wait(500) // allow ScrollContext to update scroll position store
    //   .storeScrollPosition(`middle-of-the-page`)
    //   .click()
    //   .waitForRouteChange()

    // cy.getTestElement(`long-page`)
    //   .click()
    //   .waitForRouteChange()

    // cy.getTestElement(`even-more-below-the-fold`)
    //   .scrollIntoView({
    //     // this is weird hack - seems like Cypress in run mode doesn't update scroll correctly
    //     duration: 100,
    //   })
    //   .wait(500) // allow ScrollContext to update scroll position store
    //   .storeScrollPosition(`bottom-of-the-page`)
    //   .click()
    //   .waitForRouteChange()

    // cy.go(`back`).waitForRouteChange()

    // cy.location(`pathname`)
    //   .should(`equal`, `/long-page/`)
    //   .wait(500)
    //   // we went back in hitsory 1 time, so we should end up at the bottom of the page
    //   .shouldMatchScrollPosition(`bottom-of-the-page`)
    //   .shouldNotMatchScrollPosition(`middle-of-the-page`)

    // cy.go(`back`).waitForRouteChange()
    // cy.go(`back`).waitForRouteChange()

    // cy.location(`pathname`)
    //   .should(`equal`, `/long-page/`)
    //   .wait(500)
    //   // we went back in hitsory 2 more times, so we should end up in the middle of the page
    //   // instead of at the bottom
    //   .shouldMatchScrollPosition(`middle-of-the-page`)
    //   .shouldNotMatchScrollPosition(`bottom-of-the-page`)
  })
})
