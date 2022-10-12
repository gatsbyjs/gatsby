describe(`focus management`, () => {
  it(`Focus router wrapper after navigation to regular page (from index)`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/page-2/`)
    cy.assertRouterWrapperFocus(true)
  })

  it(`Focus router wrapper after navigation to regular page (to index)`, () => {
    cy.visit(`/page-2/`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/`)
    cy.assertRouterWrapperFocus(true)
  })

  // Navigating to 404 and from 404 doesn't properly trigger focusing
  // router wrapper. That's because dev 404 is special case and new router
  // is being used when transitioning to/from 404 page and @reach/router
  // doesn't meddle with focus on initial router component mount.

  it.skip(`Focus router wrapper after navigation to 404`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/broken-path/`)
    cy.assertRouterWrapperFocus(true)
  })

  it.skip(`Focus router wrapper after navigation from 404`, () => {
    cy.visit(`/broken-path`, { failOnStatusCode: false }).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/`)
    cy.assertRouterWrapperFocus(true)
  })

  it(`Focus router wrapper after navigation from one 404 path to another 404 path`, () => {
    cy.visit(`/broken-path`, { failOnStatusCode: false }).waitForRouteChange()

    // navigating to different not existing page should also trigger
    // router wrapper focus as this is different page
    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/another-broken-path/`)
    cy.assertRouterWrapperFocus(true)
  })

  it(`Focus router wrapper after navigation to client-only page`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/client-only-paths/`)
    cy.assertRouterWrapperFocus(true)
  })

  it(`Focus router wrapper after navigation from client-only page`, () => {
    cy.visit(`/client-only-paths/`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/`)
    cy.assertRouterWrapperFocus(true)
  })

  // TODO: un-skip this tests when this is figured out
  // this failure doesn't seem to be reproducable locally,
  // but it does fail consistenly in CI
  it.skip(`Focus subrouter inside client-only page`, () => {
    cy.visit(`/client-only-paths`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/client-only-paths/page/profile`)

    // inner paths are handled by router instance defined in client-only-paths page
    // which means that navigating inside those should be handled by that router
    // (not main router provided by gatsby)
    cy.assertRouterWrapperFocus(false)
    cy.focused().should(`have.attr`, `id`, `client-only-paths-sub-router`)
  })
})
