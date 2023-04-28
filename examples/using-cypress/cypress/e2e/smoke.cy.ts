describe("Smoke tests", () => {
  it("Visits the index page and navigates", () => {
    cy.visit("/").waitForRouteChange()
    cy.findByText(/go to page 2/i)
      .click()
  })
})