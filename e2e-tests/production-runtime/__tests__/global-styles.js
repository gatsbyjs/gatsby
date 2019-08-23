const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

const zIndex = `9001`

describe(`Global style from gatsby-browser.js`, () => {
  beforeEach(async () => {
    await g.goto(`/global-style`)
    await g.waitForAPI(`onRouteUpdate`)
  })

  it(`should apply any styles in root gatsby-browser.js`, async () => {
    expect(await g.css(`global-style`, `zIndex`)).toBe(zIndex)
  })

  it(`should apply any styles in plugin(s) gatsby-browser.js`, async () => {
    expect(await g.css(`global-plugin-style`, `zIndex`)).toBe(zIndex)
  })
})
