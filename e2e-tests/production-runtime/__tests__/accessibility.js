const GatsbyPuppeteer = require(`../gatsby-puppeteer`)
const g = new GatsbyPuppeteer({ page, origin: `http://localhost:9000` })

describe(`Focus management`, () => {
  const FOCUS_WRAPPER_ID = `gatsby-focus-wrapper`

  it(`focuses router wrapper after navigation to regular page (from index)`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/page-2/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses router wrapper after navigation to regular page (to index)`, async () => {
    await g.goto(`/page-2/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses router wrapper after navigation to 404`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/broken-path/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses router wrapper after navigation from 404`, async () => {
    await g.goto(`/broken-path`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses router wrapper after navigation from one 404 path to another 404 path`, async () => {
    await g.goto(`/broken-path`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/another-broken-path/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses router wrapper after navigation to client-only page`, async () => {
    await g.goto(`/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/client-only-paths/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses router wrapper after navigation from client-only page`, async () => {
    await g.goto(`/client-only-paths/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)

    await g.navigate(`/`)
    await g.waitForAPI(`onRouteUpdate`)
    expect(await g.getFocusedID()).toBe(FOCUS_WRAPPER_ID)
  })

  it(`focuses subrouter inside client-only page`, async () => {
    await g.goto(`/client-only-paths/`)
    await g.waitForAPI(`onRouteUpdate`)

    await g.changeFocus()
    expect(await g.getFocusedID()).not.toBe(FOCUS_WRAPPER_ID)
    await g.navigate(`/client-only-paths/page/profile`)
    await g.waitForAPI(`onRouteUpdate`)

    // inner paths are handled by router instance defined in client-only-paths page
    // which means that navigating inside those should be handled by that router
    // (not main router provided by gatsby)
    expect(await g.getFocusedID()).toBe(`client-only-paths-sub-router`)
  })
})
