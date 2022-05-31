Cypress.config(`defaultCommandTimeout`, 30000) // Since we're asserting network requests

describe(`duplicate scripts`, () => {
  beforeEach(() => {
    cy.visit(`/gatsby-script-duplicate-scripts/`).waitForRouteChange()
  })

  it(`should execute load callbacks of duplicate scripts`, () => {
    cy.get(`[data-on-load-result=duplicate-1]`).should(`have.length`, 1)
    cy.get(`[data-on-load-result=duplicate-2]`).should(`have.length`, 1)
    cy.get(`[data-on-load-result=duplicate-3]`).should(`have.length`, 1)
  })

  it(`should execute error callbacks of duplicate scripts`, () => {
    cy.get(`[data-on-error-result=duplicate-1]`).should(`have.length`, 1)
    cy.get(`[data-on-error-result=duplicate-2]`).should(`have.length`, 1)
    cy.get(`[data-on-error-result=duplicate-3]`).should(`have.length`, 1)
  })
})
