Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`gatsby-ssr.tsx`, () => {
  it(`works`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`.gatsby-ssr-tsx`).should(`have.attr`, `data-content`, `TSX with gatsby-ssr works`)
  })
})