Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`focus management`, () => {
  it(`Focus router wrapper after navigation to regular page (from index)`, () => {
    cy.visit(`/`).waitForAPIorTimeout(`onRouteUpdate`, { timeout: 10000 })

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

  it(`Focus router wrapper after navigation to 404`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/broken-path/`)
    cy.assertRouterWrapperFocus(true)
  })

  it(`Focus router wrapper after navigation from 404`, () => {
    cy.visit(`/broken-path`, {
      failOnStatusCode: false,
    }).waitForAPIorTimeout(`onRouteUpdate`, { timeout: 5000 })

    cy.changeFocus()
    cy.assertRouterWrapperFocus(false)
    cy.navigateAndWaitForRouteChange(`/`)
    cy.assertRouterWrapperFocus(true)
  })

  it(`Focus router wrapper after navigation from one 404 path to another 404 path`, () => {
    cy.visit(`/broken-path`, {
      failOnStatusCode: false,
    }).waitForAPIorTimeout(`onRouteUpdate`, { timeout: 5000 })

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

  // TODO: Fix this test. Locally it works fine, but on CI it fails
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
