import { title } from "../../constants"

describe("Deferred Static Generation (DSG)", () => {
  it("should work correctly", () => {
    cy.visit("/routes/dsg/static").waitForRouteChange()

    cy.get("h1").contains("DSG")
  })
  it("should work with page queries", () => {
    cy.visit("/routes/dsg/graphql-query").waitForRouteChange()

    cy.get(`[data-testid="title"]`).should("have.text", title)
  })
})