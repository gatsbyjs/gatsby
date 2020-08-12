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
          .getTestElement(`slug`)
          .invoke(`text`)
          .should(`equal`, slug)
      })
  })

  it(`can navigate to a collection route that uses unions and collectionGraphql query and see its content rendered`, () => {
    cy.visit(`/collection-routing/root`).waitForRouteChange()

    cy.getTestElement(`collection-routing-image`)
      .invoke(`attr`, `data-testimagename`)
      .then(name => {
        // should navigate us to an actual collection builder route.
        cy.getTestElement(`collection-routing-image`)
          .first()
          .click()
          .waitForRouteChange()
          .getTestElement(`name`)
          .invoke(`text`)
          .should(`equal`, name)
      })
  })
})
