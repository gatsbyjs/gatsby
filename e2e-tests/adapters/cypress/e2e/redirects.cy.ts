Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Minified React error")) {
    return false
  }
})

describe("Redirects", () => {
  it("should redirect from non-existing page to existing", () => {
    cy.visit(`/redirect`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.get(`h1`).should(`have.text`, `Hit`)
    cy.url().should(`equal`, `${window.location.origin}/routes/redirect/hit`)
  })
  it("should respect that pages take precedence over redirects", () => {
    cy.visit(`/routes/redirect/existing`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.get(`h1`).should(`have.text`, `Existing`)
    cy.url().should(`equal`, `${window.location.origin}/routes/redirect/existing`)
  })
  it("should support hash parameter on direct visit", () => {
    cy.visit(`/redirect#anchor`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/routes/redirect/hit`)
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, ``)
  })
  it("should support search parameter on direct visit", () => {
    cy.visit(`/redirect/?query_param=hello`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/routes/redirect/hit`)
    cy.location(`hash`).should(`equal`, ``)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })
  it("should support search & hash parameter on direct visit", () => {
    cy.visit(`/redirect/?query_param=hello#anchor`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/routes/redirect/hit`)
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })
})