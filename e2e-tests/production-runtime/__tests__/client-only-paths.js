const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

describe(`Client only paths`, () => {
  const routes = [
    {
      path: `/client-only-paths/`,
      marker: `index`,
      label: `Index route`,
    },
    {
      path: `/client-only-paths/page/profile/`,
      marker: `profile`,
      label: `Dynamic route`,
    },
    {
      path: `/client-only-paths/not-found/`,
      marker: `NotFound`,
      label: `Default route (not found)`,
    },
    {
      path: `/client-only-paths/nested/`,
      marker: `nested-page/index`,
      label: `Index route inside nested router`,
    },
    {
      path: `/client-only-paths/nested/foo/`,
      marker: `nested-page/foo`,
      label: `Dynamic route inside nested router`,
    },
    {
      path: `/client-only-paths/static/`,
      marker: `static-sibling`,
      label: `Static route that is a sibling to client only path`,
    },
  ]

  describe(`work on first load`, () => {
    routes.forEach(({ path, marker, label }) => {
      it(label, async () => {
        await g.goto(path)
        await g.waitForAPI(`onRouteUpdate`)
        expect(await g.text(`dom-marker`)).toContain(marker)

        // Skipping these at the moment because behaviour is inconsistent
        // https://github.com/gatsbyjs/gatsby/issues/16533
        if (marker !== `index` && marker !== `static-sibling`)
          expect(g.path()).toBe(path)
      })
    })
  })

  describe(`work on client side navigation`, () => {
    beforeEach(async () => {
      await g.goto(`/`)
      await g.waitForAPI(`onRouteUpdate`)
    })
    routes.forEach(({ path, marker, label }) => {
      it(label, async () => {
        await g.goto(path)
        await g.waitForAPI(`onRouteUpdate`)
        expect(await g.text(`dom-marker`)).toContain(marker)
        expect(g.path()).toBe(path)
      })
    })
  })
})
