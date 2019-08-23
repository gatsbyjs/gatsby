const GatsbyPuppeteer = require(`./lib/gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

describe(`Production build tests`, () => {
  it(`should remount when navigating to different template`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`page2`)
    await g.waitForAPI(`onRouteUpdate`)

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for second page
    expect(await g.lifecycleCallCount(`componentDidMount`)).toBe(2)
    expect(await g.lifecycleCallCount(`render`)).toBe(2)
  })

  it(`should remount when navigating to different page using same template`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`duplicated`)
    await g.waitForAPI(`onRouteUpdate`)

    // we expect 2 `componentDidMount` calls - 1 for initial page and 1 for duplicated page
    expect(await g.lifecycleCallCount(`componentDidMount`)).toBe(2)
    expect(await g.lifecycleCallCount(`render`)).toBe(2)
  })

  it(`should NOT remount when navigating within client only paths`, async () => {
    await g.goto(`/client-only-paths`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`/page/profile`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.click(`/nested/foo`)
    await g.waitForAPI(`onRouteUpdate`)

    // we expect just 1 `componentDidMount` call, when navigating inside matchPath
    expect(await g.lifecycleCallCount(`componentDidMount`)).toBe(1)
    expect(await g.lifecycleCallCount(`render`)).toBe(3)
  })
})
