/* eslint-disable no-undef */

describe(`Production build tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`)
  })

  it(`should navigate back after a reload`, () => {
    cy.getTestElement(`page2`)
      .first()
      .click()

    cy.waitForRouteChange()
      .url()
      .should(`contain`, `page-2`)

    cy.reload()
      .waitForRouteChange()
      .go(`back`)

    cy.waitForRouteChange()
      .getTestElement(`page2`)
      .should(`exist`)
  })
})
