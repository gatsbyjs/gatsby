/// <reference types="cypress" />

context("Linking between pages", () => {
  it("should navigate to Contact after clicking a Gatsby link", () => {
    cy.visit("http://localhost:8888")

    cy.get("a").click()

    cy.location("pathname").should("eq", "/contact/")

    cy.get("main").should("include.text", "Contact")
  })
  it("should link back to the homepage from Contact", () => {
    cy.visit("http://localhost:8888/contact")

    cy.get("a").click()

    cy.location("pathname").should("eq", "/")

    cy.get("main").should("include.text", "What a world.")
  })
})
