describe(`queries in packages`, () => {
  beforeEach(() => {
    cy.visit(`/queries-in-packages`).waitForRouteChange()
  })

  it(`Should extract and run query from gatsby component`, () => {
    // we are using `gatsby-seo` package which sets
    // window's title to title passed as prop followed by siteMetadata.title
    cy.title().should(
      `eq`,
      `Testing queries in packages | Gatsby Default Starter`
    )
  })
})
