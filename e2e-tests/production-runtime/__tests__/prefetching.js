const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

describe(`Prefetching`, () => {
  if (process.env.CONNECTION_TYPE === `slow`) {
    it(`should not prefetch if on slow connection`, async () => {
      await g.goto(`/`)
      await g.waitForAPI(`onRouteUpdate`)

      const isPrefetching = await page.evaluate(() =>
        window.___loader.enqueue(`/page-2`)
      )
      expect(isPrefetching).toBe(false)

      expect(await page.$(`link[rel="prefetch"]`)).toBeNull()
      expect(await g.lifecycleCallCount(`onPrefetchPathname`)).toBe(0)
    })
  } else {
    it(`should prefetch`, async () => {
      await g.goto(`/`)
      await g.waitForAPI(`onRouteUpdate`)

      const isPrefetching = await page.evaluate(() =>
        window.___loader.enqueue(`/page-2`)
      )
      expect(isPrefetching).toBe(true)

      expect(await page.$(`link[rel="prefetch"]`)).toBeDefined()
      expect(await g.lifecycleCallCount(`onPrefetchPathname`)).not.toBe(0)
    })
  }
})
