describe(`collection-routing`, () => {
  beforeEach(() => {
    cy.visit(`/collection-routing`).waitForRouteChange()
  })

  it(`can create simplest collection route that also has a number as an identifier`, () => {
    cy.visit(`/collection-routing/1/`)
      .waitForRouteChange()
    cy.findByTestId(`slug`)
      .should(`have.text`, `/preview/1`)
    cy.findByTestId(`pagecontext`)
      .should(`have.text`, `1`)
  })

  it(`can navigate to a collection route and see its content rendered`, () => {
    cy.findByTestId(`collection-routing-blog-0`)
    cy.should(`have.attr`, `data-testslug`, `/2018-12-14-hello-world/`)
      .click()
    cy.waitForRouteChange()
      .assertRoute(`/collection-routing/2018-12-14-hello-world/`)
    cy.findByTestId(`slug`)
    cy.should(`have.text`, `/2018-12-14-hello-world/`)
    cy.findByTestId(`pagecontext`)
    cy.should(`have.text`, `/2018-12-14-hello-world/`)
  })

  it(`can navigate to a collection route that uses unions and collectionGraphql query and see its content rendered`, () => {
    cy.findByTestId(`collection-routing-image-0`)
    cy.should(`have.attr`, `data-testimagename`, `gatsby-astronaut`)
      .click()
    cy.waitForRouteChange()
      .assertRoute(`/collection-routing/gatsby-astronaut`)
    cy.findByTestId(`name`)
    cy.should(`have.text`, `gatsby-astronaut`)
    cy.findByTestId(`pagecontext`)
    cy.should(`have.text`, `gatsby-astronaut`)
  })

  it(`should respect collectionGraphql and create only one image instance`, () => {
    cy.visit(`/collection-routing/gatsby-icon`)
    cy.waitForRouteChange()
    cy.findByTestId(`name`)
    cy.should(`not.exist`)
  })
})
