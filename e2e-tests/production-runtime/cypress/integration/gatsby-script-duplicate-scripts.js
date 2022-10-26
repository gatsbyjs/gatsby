Cypress.config(`defaultCommandTimeout`, 30000) // Since we're asserting network requests

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

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
