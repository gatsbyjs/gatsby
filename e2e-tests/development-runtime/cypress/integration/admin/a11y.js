// NOTE(@mxstbr): Need to resolve the a11y violations
describe("Accessibility", () => {
  beforeEach(() => {
    cy.visit("/___admin").get("body").injectAxe()
  })

  it("Has no detectable accessibility violations on load", () => {
    cy.contains("Plugins")
    cy.checkA11y()
  })
})
