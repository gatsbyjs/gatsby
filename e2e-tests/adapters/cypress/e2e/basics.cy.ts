import { title } from "../../constants"

describe("Basics", () => {
  beforeEach(() => {
    cy.intercept("/gatsby-icon.png").as("static-folder-image")
    cy.intercept("/static/astro-**.png").as("img-import")

    // clear browser cache before each test - otherwise permanently cached assets (like img-import)
    // would be intercepted only on very first test
    cy.wrap(
      Cypress.automation("remote:debugger:protocol", {
        command: "Network.clearBrowserCache",
      })
    )

    cy.visit("/").waitForRouteChange()
  })

  it("should display index page", () => {
    cy.get("h1").should("have.text", title)
    cy.title().should("eq", "Adapters E2E")
  })
  // If this test fails, run "gatsby build" and retry
  it('should serve assets from "static" folder', () => {
    cy.wait("@static-folder-image").should(req => {
      expect(req.response.statusCode).to.be.eq(200)
    })

    cy.get('[alt="Gatsby Monogram Logo"]').should("be.visible")
  })
  it("should serve assets imported through webpack", () => {
    cy.wait("@img-import").should(req => {
      expect(req.response.statusCode).to.be.eq(200)
    })

    cy.get('[alt="Gatsby Astronaut"]').should("be.visible")
  })
  it(`should show custom 404 page on invalid URL`, () => {
    cy.visit(`/non-existent-page`, {
      failOnStatusCode: false,
    })

    cy.get("h1").should("have.text", "Page not found")
  })
  it("should apply CSS", () => {
    cy.get(`h1`).should(`have.css`, `color`, `rgb(21, 21, 22)`)
  })
})
