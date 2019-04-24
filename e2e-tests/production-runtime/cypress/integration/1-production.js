/* global Cypress, cy */

describe(`Production build tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`).waitForRouteChange()
  })

  if (Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    it(`should activate the service worker`, () => {
      cy.waitForAPI(`onServiceWorkerActive`)
    })
  }

  it(`should navigate back after a reload`, () => {
    cy.getTestElement(`page2`).click()

    cy.waitForRouteChange()
      .location(`pathname`)
      .should(`equal`, `/page-2/`)

    cy.reload()
      .waitForRouteChange()
      .go(`back`)

    cy.waitForRouteChange()
      .getTestElement(`page2`)
      .should(`exist`)
      .location(`pathname`)
      .should(`equal`, `/`)
  })

  it(`should work when visiting a page with direct URL entry or an external link`, () => {
    cy.visit(`/page-2/`)
      .waitForRouteChange()
      .getTestElement(`index-link`)
      .should(`exist`)
      .location(`pathname`)
      .should(`equal`, `/page-2/`)
  })

  it(`should show 404 page when clicking a link to a non-existent page route`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.getTestElement(`404`).click()

    cy.waitForRouteChange()
      .location(`pathname`)
      .should(`equal`, `/page-3/`)
      .getTestElement(`404`)
      .should(`exist`)
  })

  it(`should show 404 page when directly entering an invalid URL`, () => {
    cy.visit(`/non-existent-page/`, {
      failOnStatusCode: false,
    })

    cy.waitForRouteChange()
      .getTestElement(`404`)
      .should(`exist`)
  })

  it(`should navigate back after a 404 from a direct link entry`, () => {
    cy.visit(`/`).waitForRouteChange()

    cy.visit(`/non-existent-page/`, {
      failOnStatusCode: false,
    })

    cy.waitForRouteChange()
      .go(`back`)
      .waitForRouteChange()
      .getTestElement(`index-link`)
      .should(`exist`)
  })

  it(`Uses env vars`, () => {
    cy.visit(`/env-vars`).waitForRouteChange()

    cy.getTestElement(`process.env`).contains(`{}`)
    cy.getTestElement(`process.env.EXISTING_VAR`).contains(`"foo bar"`)
    cy.getTestElement(`process.env.NOT_EXISTING_VAR`).should(`be.empty`)
  })
})
