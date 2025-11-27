describe(`queries in packages`, () => {
  beforeEach(() => {
    cy.visit(`/queries-in-packages`).waitForRouteChange()
  })

  it(`Should extract and run query from gatsby component`, () => {
    // Note: in dev this may take a few ms to be populated due to the way the Gatsby Head API is
    // implemented
    cy.get("head > title").should(
      `have.text`,
      `Testing queries in packages | Gatsby Default Starter`
    )
  })
})
