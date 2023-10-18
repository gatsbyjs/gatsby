import { title } from "../../constants"

describe("Basics", () => {
  beforeEach(() => {
    cy.intercept("/gatsby-icon.png", req => {
      req.on("before:response", res => {
        // force all API responses to not be cached
        res.headers["cache-control"] = "no-store"
      })
    }).as("static-folder-image")
    cy.intercept("/static/astro-**.png", req => {
      req.on("before:response", res => {
        // force all API responses to not be cached
        res.headers["cache-control"] = "no-store"
      })
    }).as("img-import")

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
