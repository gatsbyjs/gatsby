import { applyTrailingSlashOption } from "../../utils"

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Minified React error")) {
    return false
  }
})

const TRAILING_SLASH = Cypress.env(`TRAILING_SLASH`) || `never`

// Those tests won't work using `gatsby serve` because it doesn't support redirects

describe("Redirects", () => {
  it("should redirect from non-existing page to existing", () => {
    cy.visit(applyTrailingSlashOption(`/redirect`, TRAILING_SLASH), {
      failOnStatusCode: false,
    }).waitForRouteChange()
      .assertRoute(applyTrailingSlashOption(`/routes/redirect/hit`, TRAILING_SLASH))

    cy.get(`h1`).should(`have.text`, `Hit`)
  })
  it("should respect that pages take precedence over redirects", () => {
    cy.visit(applyTrailingSlashOption(`/routes/redirect/existing`, TRAILING_SLASH), {
      failOnStatusCode: false,
    }).waitForRouteChange()
      .assertRoute(applyTrailingSlashOption(`/routes/redirect/existing`, TRAILING_SLASH))

    cy.get(`h1`).should(`have.text`, `Existing`)
  })
  it("should support hash parameter on direct visit", () => {
    cy.visit(applyTrailingSlashOption(`/redirect`, TRAILING_SLASH) + `#anchor`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, applyTrailingSlashOption(`/routes/redirect/hit`, TRAILING_SLASH))
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, ``)
  })
  it("should support search parameter on direct visit", () => {
    cy.visit(applyTrailingSlashOption(`/redirect`, TRAILING_SLASH) + `?query_param=hello`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, applyTrailingSlashOption(`/routes/redirect/hit`, TRAILING_SLASH))
    cy.location(`hash`).should(`equal`, ``)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })
  it("should support search & hash parameter on direct visit", () => {
    cy.visit(applyTrailingSlashOption(`/redirect`, TRAILING_SLASH) + `?query_param=hello#anchor`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, applyTrailingSlashOption(`/routes/redirect/hit`, TRAILING_SLASH))
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })
})