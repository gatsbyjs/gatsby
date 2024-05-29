import { assertPageVisits } from "../utils/assert-page-visits"
import { applyTrailingSlashOption } from "../../utils"

Cypress.on("uncaught:exception", err => {
  if (err.message.includes("Minified React error")) {
    return false
  }
})

const TRAILING_SLASH = Cypress.env(`TRAILING_SLASH`) || `never`

describe("trailingSlash", () => {
  describe(TRAILING_SLASH, () => {
    it("should work when using Gatsby Link (without slash)", () => {
      cy.visit("/").waitForRouteChange()

      cy.get(`[data-testid="static-without-slash"]`)
        .click()
        .waitForRouteChange()
        .assertRoute(
          applyTrailingSlashOption(`/routes/ssg/static`, TRAILING_SLASH)
        )
    })
    it("should work when using Gatsby Link (with slash)", () => {
      cy.visit("/").waitForRouteChange()

      cy.get(`[data-testid="static-with-slash"]`)
        .click()
        .waitForRouteChange()
        .assertRoute(
          applyTrailingSlashOption(`/routes/ssg/static`, TRAILING_SLASH)
        )
    })
    it("should work on direct visit (with other setting)", () => {
      const destination = applyTrailingSlashOption(
        "/routes/ssg/static",
        TRAILING_SLASH
      )
      const inverse =
        TRAILING_SLASH === `always`
          ? "/routes/ssg/static"
          : "/routes/ssg/static/"

      assertPageVisits([
        {
          path: destination,
          status: 200,
        },
        { path: inverse, status: 301, destinationPath: destination },
      ])

      cy.visit(inverse)
        .waitForRouteChange()
        .assertRoute(
          applyTrailingSlashOption(`/routes/ssg/static`, TRAILING_SLASH)
        )
    })
    it("should work on direct visit (with current setting)", () => {
      assertPageVisits([
        {
          path: applyTrailingSlashOption("/routes/ssg/static", TRAILING_SLASH),
          status: 200,
        },
      ])

      cy.visit(applyTrailingSlashOption("/routes/ssg/static", TRAILING_SLASH))
        .waitForRouteChange()
        .assertRoute(
          applyTrailingSlashOption(`/routes/ssg/static`, TRAILING_SLASH)
        )
    })
  })
})
