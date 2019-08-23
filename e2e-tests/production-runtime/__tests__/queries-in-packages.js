const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

describe(`queries in packages`, () => {
  beforeEach(async () => {
    await g.goto(`/queries-in-packages`)
    await g.waitForAPI(`onRouteUpdate`)
  })

  it(`Should extract and run query from gatsby component`, async () => {
    // we are using `gatsby-seo` package which sets
    // window's title to title passed as prop followed by siteMetadata.title
    expect(await page.title()).toBe(
      `Testing queries in packages | Gatsby Default Starter`
    )
  })
})
