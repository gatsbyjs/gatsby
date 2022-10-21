Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Preloads`, () => {
  it(`should not have preloads in head`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`head link[rel="preload"]`).should("not.exist")
  })
})
