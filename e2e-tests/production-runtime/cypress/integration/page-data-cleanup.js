/* global Cypress, cy */

/**
 * First we run a build with a specific page we create and use that for our tests
 * then we run another build without that page and run a second set of tests
 *
 * The tests are to ensure page-data.json files are removed with page html
 * so that we don't serve stale page data for deleted pages
 */
if (!Cypress.env(`SKIP_PAGE_CREATION`)) {
  it(`checks if page html exists`, () => {
    cy.visit(`/page-data-test/`).waitForRouteChange()
    cy.getTestElement(`dom-marker`).contains(`page-data-test`)
  })

  it(`can navigate`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.getTestElement(`page-with-page-data-test`)
      .click()
      .waitForRouteChange()
    cy.getTestElement(`dom-marker`).contains(`page-data-test`)
  })
} else {
  it(`check if html no longer exists`, () => {
    cy.visit(`/page-data-test/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()
    cy.getTestElement(`dom-marker`).contains(`404`)
  })

  it(`can't navigate`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.getTestElement(`page-with-page-data-test`)
      .click()
      .waitForRouteChange()
    cy.getTestElement(`dom-marker`).contains(`404`)
    cy.getTestElement(`dom-marker`)
      .invoke(`text`)
      .should(`not.contain`, `page-data-test`)
  })
}
