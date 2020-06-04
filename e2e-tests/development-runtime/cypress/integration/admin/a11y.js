// NOTE(@mxstbr): Need to resolve the a11y violations
describe.skip("Accessibility", () => {
  beforeEach(() => {
    cy.visit("/___admin").get("body").injectAxe()
  })

  it("Has no detectable accessibility violations on load", () => {
    cy.checkA11y()
  })
})
