Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) {
    return false
  }
})

describe(`client-side-routing`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`supports dynamic url segments`, () => {
    cy.visit(`/client-dynamic-route/foo`).waitForRouteChange()

    cy.getTestElement(`params`).invoke(`text`).should(`equal`, `foo`)
  })

  it(`supports splats`, () => {
    cy.visit(`/client-dynamic-route/splat/blah/blah/blah`).waitForRouteChange()

    cy.getTestElement(`splat`).invoke(`text`).should(`equal`, `blah/blah/blah`)
  })
})
