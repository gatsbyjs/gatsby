/// <reference types="cypress" />

describe("React 19 Compatibility", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("renders the home page", () => {
    cy.get("h1").should("contain", "Gatsby + React 19 Test")
  })

  it("handles React 19 state updates", () => {
    // Initial state
    cy.get("p").should("contain", "Count: 0")

    // Test state update
    cy.get('[data-testid="increment"]').click()
    cy.get("p").should("contain", "Count: 1")
  })

  it("handles React 19 error boundaries", () => {
    // Test error boundary
    cy.get('[data-testid="error-button"]').click()
    cy.get("div").should("contain", "Error: Test error")
  })
})
