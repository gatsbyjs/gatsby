import { name } from "../../../package.json"

describe("Gatsby Admin", () => {
  beforeEach(() => {
    cy.visit("/___admin")
  })

  it("Shows Admin for the current site", () => {
    cy.contains("Gatsby Admin")
    cy.contains(name)
  })
})
