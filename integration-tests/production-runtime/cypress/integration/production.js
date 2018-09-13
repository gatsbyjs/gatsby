/* global cy */

describe(`Production build tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`should navigate back after a reload`, () => {
    cy.getTestElement(`page2`)
      .first()
      .click()

    cy.waitForRouteChange()
      .location(`pathname`)
      .should(`equal`, `/page-2/`)

    cy.reload()
      .go(`back`)

    cy.waitForRouteChange()
      .getTestElement(`page2`)
      .should(`exist`)
      .location(`pathname`)
      .should(`equal`, `/`)
  })
})
