describe(`collection-routing`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`can navigate to a collection route and see its content rendered`, () => {
    cy.visit(`/collection-routing/root`).waitForRouteChange()

    cy.getTestElement(`collection-routing-blog`)
      .invoke(`attr`, `data-testslug`)
      .then(slug => {
        // should navigate us to an actual collection builder route.
        cy.getTestElement(`collection-routing-blog`)
          .first()
          .click()
          .waitForRouteChange()

        cy.getTestElement(`testslug`).invoke(`text`).should(`equal`, slug)
      })
  })
})
