describe(`queries in packages`, () => {
  beforeEach(() => {
    cy.visit(`/queries-in-packages`).waitForRouteChange()
  })

  it(`Should extract and run query from gatsby component`, () => {
    cy.title().should(
      `eq`,
      `Testing queries in packages | Gatsby Default Starter`
    )
  })
})
