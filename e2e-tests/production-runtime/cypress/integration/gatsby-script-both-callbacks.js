Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`both onLoad and onError callbacks are declared`, () => {
  beforeEach(() => {
    cy.visit(`/gatsby-script-both-callbacks/`).waitForRouteChange()
  })

  it(`should execute the onLoad callback`, () => {
    cy.get(`[data-on-load-result=both-callbacks]`).should(`have.length`, 1)
  })

  it(`should execute the onError callback`, () => {
    cy.get(`[data-on-error-result=both-callbacks]`).should(`have.length`, 1)
  })
})
