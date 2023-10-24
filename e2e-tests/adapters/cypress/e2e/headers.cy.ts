import { title } from "../../constants"

describe("Headers", () => {
  beforeEach(() => {
    beforeEach(() => {
      cy.reload(true)
    })
    cy.visit("/").waitForRouteChange()
  })

  it("should contain correct headers for index page", () => {
    cy.intercept("/").as("index")

    cy.visit("/")

    cy.wait("@index")
      .its("response.headers.x-custom-header")
      .should("eq", "my custom header value")
    cy.wait("@index")
      .its("response.headers.x-xss-protection")
      .should("eq", "1; mode=block")
    cy.wait("@index")
      .its("response.headers.x-content-type-options")
      .should("eq", "nosniff")
    cy.wait("@index")
      .its("response.headers.referrer-policy")
      .should("eq", "same-origin")
    cy.wait("@index")
      .its("response.headers.x-frame-options")
      .should("eq", "DENY")
  })

  it("should contain correct headers for static assest", () => {
    cy.intercept("/static/astro-**.png").as("img-import")

    cy.visit("/")

    cy.wait("@img-import")
      .its("response.headers.cache-control")
      .should("eq", "public, max-age=31536000, immutable")
    cy.wait("@img-import")
      .its("response.headers.x-xss-protection")
      .should("eq", "1; mode=block")
    cy.wait("@img-import")
      .its("response.headers.x-content-type-options")
      .should("eq", "nosniff")
    cy.wait("@img-import")
      .its("response.headers.referrer-policy")
      .should("eq", "same-origin")
    cy.wait("@img-import")
      .its("response.headers.x-frame-options")
      .should("eq", "DENY")
  })

  it("should contain correct headers for ssr page", () => {
    cy.intercept("/ssr/static").as("ssr")

    cy.visit("/ssr/static")

    cy.wait("@ssr")
      .its("response.headers.x-ssr-header")
      .should("eq", "my custom header value from config")
    cy.wait("@ssr")
      .its("response.headers.x-xss-protection")
      .should("eq", "1; mode=block")
    cy.wait("@ssr")
      .its("response.headers.x-content-type-options")
      .should("eq", "nosniff")
    cy.wait("@ssr")
      .its("response.headers.referrer-policy")
      .should("eq", "same-origin")
    cy.wait("@ssr").its("response.headers.x-frame-options").should("eq", "DENY")
  })

  it("should contain correct headers for dsg page", () => {
    cy.intercept("/dsg/static").as("dsg")

    cy.visit("/dsg/static")

    cy.wait("@dsg")
      .its("response.headers.x-dsg-header")
      .should("eq", "my custom header value")
    cy.wait("@dsg")
      .its("response.headers.x-xss-protection")
      .should("eq", "1; mode=block")
    cy.wait("@dsg")
      .its("response.headers.x-content-type-options")
      .should("eq", "nosniff")
    cy.wait("@dsg")
      .its("response.headers.referrer-policy")
      .should("eq", "same-origin")
    cy.wait("@dsg").its("response.headers.x-frame-options").should("eq", "DENY")
  })
})
