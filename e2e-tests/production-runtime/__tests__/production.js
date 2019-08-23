const GatsbyPuppeteer = require(`../gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

describe(`Production build tests`, () => {
  it(`should render properly`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)
  })

  if (process.env.TEST_PLUGIN_OFFLINE) {
    it(`should activate the service worker`, async () => {
      await g.waitForAPI(`onServiceWorkerActive`)
    })
  }

  it(`should navigate back after a reload`, async () => {
    await g.click(`page2`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(g.path()).toBe(`/page-2/`)

    await page.reload()
    await g.waitForAPI(`onRouteUpdate`)
    await page.goBack()
    await g.waitForAPI(`onRouteUpdate`)

    expect(await g.get(`page2`)).toBeDefined()
    expect(g.path()).toBe(`/`)
  })

  it(`should work when visiting a page with direct URL entry or an external link`, async () => {
    await g.goto(`/page-2/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.get(`index-link`)).toBeDefined()
    expect(g.path()).toBe(`/page-2/`)
  })

  it(`should show 404 page when clicking a link to a non-existent page route`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`404`)
    await g.waitForAPI(`onRouteUpdate`)

    expect(g.path()).toBe(`/page-3/`)
    expect(await g.get(`404`)).toBeDefined()
  })

  it(`should show 404 page when directly entering an invalid URL`, async () => {
    await g.goto(`/non-existent-page/`)
    await g.waitForAPI(`onRouteUpdate`)

    expect(await g.get(`404`)).toBeDefined()
  })

  it(`should navigate back after a 404 from a direct link entry`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.goto(`/non-existent-page/`)
    await g.waitForAPI(`onRouteUpdate`)

    await page.goBack()
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.get(`index-link`)).toBeDefined()
  })

  it(`should pass pathContext to props`, async () => {
    await g.goto(`/path-context`)
    await g.waitForAPI(`onRouteUpdate`)

    // `bar` is set in gatsby-node createPages
    expect(await g.text(`path-context-foo`)).toContain(`bar`)
  })

  it(`Uses env vars`, async () => {
    await g.goto(`/env-vars`)
    await g.waitForAPI(`onRouteUpdate`)

    expect(await g.text(`process.env`)).toBe(`{}`)
    expect(await g.text(`process.env.EXISTING_VAR`)).toBe(`"foo bar"`)
    expect(await g.html(`process.env.NOT_EXISTING_VAR`)).toBe(``)
  })

  describe(`Supports unicode characters in urls`, () => {
    it(`Can navigate directly`, async () => {
      await g.goto(`/안녕/`)
      await g.waitForAPI(`onRouteUpdate`)

      expect(await g.text(`page-2-message`)).toBe(`Hi from the second page`)
    })
    it(`Can navigate on client`, async () => {
      await g.goto(`/`)
      await g.waitForAPI(`onRouteUpdate`)
      await g.click(`page-with-unicode-path`)
      await g.waitForAPI(`onRouteUpdate`)

      expect(await g.text(`page-2-message`)).toBe(`Hi from the second page`)
    })
  })
})
