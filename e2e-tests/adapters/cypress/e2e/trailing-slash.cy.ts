Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Minified React error")) {
    return false
  }
})

describe("trailingSlash", () => {
  it("should work when using Gatsby Link (without slash)", () => {
    cy.visit('/').waitForRouteChange()

    cy.get(`[data-testid="static-without-slash"]`).click().waitForRouteChange()
    cy.url().should(`equal`, `${window.location.origin}/routes/static`)
  })
  it("should work when using Gatsby Link (with slash)", () => {
    cy.visit('/').waitForRouteChange()

    cy.get(`[data-testid="static-with-slash"]`).click().waitForRouteChange()
    cy.url().should(`equal`, `${window.location.origin}/routes/static`)
  })
  it("should work on direct visit (without slash)", () => {
    cy.visit(`/routes/static`).waitForRouteChange()

    cy.url().should(`equal`, `${window.location.origin}/routes/static`)
  })
  it("should work on direct visit (with slash)", () => {
    cy.visit(`/routes/static/`).waitForRouteChange()

    cy.url().should(`equal`, `${window.location.origin}/routes/static`)
  })
})
