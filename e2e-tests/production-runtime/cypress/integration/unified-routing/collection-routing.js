Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`collection-routing`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`can navigate to a collection route and see its content rendered`, () => {
    cy.visit(`/collection-routing/root`).waitForRouteChange()

    cy.getTestElement(`collection-routing-blog`)
      .invoke(`attr`, `data-testproductname`)
      .then(name => {
        // should navigate us to an actual collection builder route.
        cy.getTestElement(`collection-routing-blog`)
          .first()
          .click()
          .waitForRouteChange()

        cy.getTestElement(`name`).invoke(`text`).should(`equal`, name)
      })
  })
})
