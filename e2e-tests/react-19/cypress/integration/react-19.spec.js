/// <reference types="cypress" />

describe("React 19 specific tests", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("renders the home page", () => {
    cy.get("h1").should("contain", "Gatsby + React 19 Test")
  })

  it("handles React 19 state updates", () => {
    cy.get("p").should("contain", "Count: 0")

    cy.get('[data-testid="increment"]').click()
    cy.get("p").should("contain", "Count: 1")
  })

  it("calls provided React 19 onCaughtError callback", () => {
    cy.get('[data-testid="throwing-component"]').should(
      "contain",
      "Component rendered successfully"
    )

    cy.get('[data-testid="trigger-caught-error"]').click()

    cy.get('[data-testid="error-boundary-fallback"]').should(
      "contain",
      "Error boundary caught: Caught error from component"
    )
  })

  it("passes uncaught errors along to React Fast Refresh error overlay", () => {
    cy.on("uncaught:exception", err => {
      if (err.message.includes("Uncaught error from event handler")) {
        return false
      }
    })

    cy.get('[data-testid="trigger-uncaught-error"]').click()

    cy.get(`gatsby-fast-refresh`)
      .shadow()
      .find(`[data-gatsby-overlay="body__error-message"]`)
      .should("have.text", "Uncaught error from event handler")
  })
})
