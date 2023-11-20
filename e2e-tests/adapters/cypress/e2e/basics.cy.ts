import { title } from "../../constants"
import { WorkaroundCachedResponse } from "../utils/dont-cache-responses-in-browser"

const PATH_PREFIX = Cypress.env(`PATH_PREFIX`) || ``

describe("Basics", () => {
  beforeEach(() => {
    cy.intercept(PATH_PREFIX + "/gatsby-icon.png").as("static-folder-image")
    cy.intercept(
      PATH_PREFIX + "/static/astro-**.png",
      WorkaroundCachedResponse
    ).as("img-import")

    cy.visit("/").waitForRouteChange()
  })

  it("should display index page", () => {
    cy.get("h1").should("have.text", title)
    cy.title().should("eq", "Adapters E2E")
  })
  // If this test fails, run "gatsby build" and retry
  it('should serve assets from "static" folder', () => {
    cy.wait("@static-folder-image").should(req => {
      expect(req.response.statusCode).to.be.gte(200).and.lt(400)
    })

    cy.get('[alt="Gatsby Monogram Logo"]').should("be.visible")
  })
  it("should serve assets imported through webpack", () => {
    cy.wait("@img-import").should(req => {
      expect(req.response.statusCode).to.be.gte(200).and.lt(400)
    })

    cy.get('[alt="Gatsby Astronaut"]').should("be.visible")
  })
  it(`should show custom 404 page on invalid URL`, () => {
    cy.visit(`/non-existent-page`, {
      failOnStatusCode: false,
    })

    cy.get("h1").should("have.text", "Page not found (custom)")
  })
  it("should apply CSS", () => {
    cy.get(`h1`).should(`have.css`, `color`, `rgb(21, 21, 22)`)
  })
})
