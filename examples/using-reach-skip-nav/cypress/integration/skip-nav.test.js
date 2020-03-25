describe("Skip Navigation Test", function() {
  it("Does not do much!", function() {
    expect(true).to.equal(true)
  })

  it("Has a skip link", function() {
    cy.visit("/")
    cy.get("[data-reach-skip-link]").should("exist")
  })

  it("focuses skip link on navigation", function() {
    cy.get("[data-cy-page-link]").click()
    cy.focused().should("have.attr", "data-reach-skip-link")
  })
})
