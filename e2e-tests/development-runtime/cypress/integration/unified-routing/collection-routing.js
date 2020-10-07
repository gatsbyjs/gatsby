describe(`collection-routing`, () => {
  beforeEach(() => {
    cy.visit(`/collection-routing/root`).waitForRouteChange()
  })

  it(`can navigate to a collection route and see its content rendered`, () => {
    cy.findByTestId(`collection-routing-blog`)
    cy.should(`have.attr`, `data-testslug`, `/2018-12-14-hello-world/`)
      .click()
    cy.waitForRouteChange()
      .assertRoute(`/collection-routing/2018-12-14-hello-world/`)
    cy.findByTestId(`slug`)
    cy.should(`have.text`, `/2018-12-14-hello-world/`)
  })

  it(`can navigate to a collection route that uses unions and collectionGraphql query and see its content rendered`, () => {
    cy.findByTestId(`collection-routing-image`)
    cy.should(`have.attr`, `data-testimagename`, `gatsby-astronaut`)
      .click()
    cy.waitForRouteChange()
      .assertRoute(`/collection-routing/gatsby-astronaut`)
    cy.findByTestId(`name`)
    cy.should(`have.text`, `gatsby-astronaut`)
  })
})
