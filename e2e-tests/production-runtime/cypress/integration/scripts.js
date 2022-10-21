Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Preloads`, () => {
  it(`should not have page scripts in HTML`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`body script`).each(script => {
      cy.wrap(script).should(`not.have.attr`, `src`, /component---/)
    })
  })
})
