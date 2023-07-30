import { siteDescription } from "../../constants"

describe("Slices", () => {
  it("should work correctly", () => {
    cy.visit('/').waitForRouteChange()

    cy.get(`footer`).should("have.text", siteDescription)
  })
})