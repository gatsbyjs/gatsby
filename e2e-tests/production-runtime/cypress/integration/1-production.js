/* global Cypress, cy */

describe(`Production build tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })

  if (Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    it(`should activate the service worker`, () => {
      cy.waitForAPI(`onServiceWorkerActive`)
    })
  }

  it(`should restore scroll position only when going back in history`, () => {
    cy.getTestElement(`long-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.scrollTo(`bottom`)

    // allow ScrollContext to update scroll position store
    // it uses requestAnimationFrame so wait a bit to allow
    // it to store scroll position
    cy.wait(500)

    cy.getTestElement(`below-the-fold`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    // after going back we expect page will
    // be restore previous scroll position
    cy.go(`back`).waitForAPI(`onRouteUpdate`)

    cy.window().then(win => {
      expect(win.scrollY).not.to.eq(0, 0)
    })

    cy.go(`forward`).waitForAPI(`onRouteUpdate`)

    // after clicking link we expect page will be scrolled to top
    cy.getTestElement(`long-page`)
      .click()
      .waitForAPI(`onRouteUpdate`)

    cy.window().then(win => {
      expect(win.scrollY).to.eq(0, 0)
    })

    // reset to index page
    cy.getTestElement(`index-link`)
      .click()
      .waitForAPI(`onRouteUpdate`)
  })

  it(`should navigate back after a reload`, () => {
    cy.getTestElement(`page2`).click()

    cy.waitForAPI(`onRouteUpdate`)
      .location(`pathname`)
      .should(`equal`, `/page-2/`)

    cy.reload()
      .waitForAPI(`onRouteUpdate`)
      .go(`back`)

    cy.waitForAPI(`onRouteUpdate`)
      .getTestElement(`page2`)
      .should(`exist`)
      .location(`pathname`)
      .should(`equal`, `/`)
  })

  it(`should work when visiting a page with direct URL entry or an external link`, () => {
    cy.visit(`/page-2/`)
      .waitForAPI(`onRouteUpdate`)
      .getTestElement(`index-link`)
      .should(`exist`)
      .location(`pathname`)
      .should(`equal`, `/page-2/`)
  })

  it(`should show 404 page when clicking a link to a non-existent page route`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`404`).click()

    cy.waitForAPI(`onRouteUpdate`)
      .location(`pathname`)
      .should(`equal`, `/page-3/`)
      .getTestElement(`404`)
      .should(`exist`)
  })

  it(`should show 404 page when directly entering an invalid URL`, () => {
    cy.visit(`/non-existent-page/`, {
      failOnStatusCode: false,
    })

    cy.waitForAPI(`onRouteUpdate`)
      .getTestElement(`404`)
      .should(`exist`)
  })

  it(`should navigate back after a 404 from a direct link entry`, () => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)

    cy.visit(`/non-existent-page/`, {
      failOnStatusCode: false,
    })

    cy.waitForAPI(`onRouteUpdate`)
      .go(`back`)
      .waitForAPI(`onRouteUpdate`)
      .getTestElement(`index-link`)
      .should(`exist`)
  })

  it(`Uses env vars`, () => {
    cy.visit(`/env-vars`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`process.env`).contains(`{}`)
    cy.getTestElement(`process.env.EXISTING_VAR`).contains(`"foo bar"`)
    cy.getTestElement(`process.env.NOT_EXISTING_VAR`).should(`be.empty`)
  })
})
