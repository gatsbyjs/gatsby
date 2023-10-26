import { title } from "../../constants"

describe("Headers", () => {
  function checkHeaders(routeAlias, expectedHeaders) {
    cy.wait(routeAlias).then(interception => {
      Object.keys(expectedHeaders).forEach(headerKey => {
        expect(interception.response.headers[headerKey]).to.eq(
          expectedHeaders[headerKey]
        )
      })
    })
  }

  const defaultHeaders = {
    "x-xss-protection": "1; mode=block",
    "x-content-type-options": "nosniff",
    "referrer-policy": "same-origin",
    "x-frame-options": "DENY",
  }

  it("should contain correct headers for index page", () => {
    cy.intercept("/").as("index")
    cy.visit("/")

    checkHeaders("@index", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
    })
  })

  //   it("should contain correct headers for static assets", () => {
  //     cy.intercept("/static/astro-*.png").as(
  //       "img-import"
  //     )
  //     cy.visit("/.png")

  //     checkHeaders("@img-import", {
  //       ...defaultHeaders,
  //       "cache-control": "public, max-age=31536000, immutable",
  //     })
  //   })

  it("should contain correct headers for ssr page", () => {
    cy.intercept("routes/ssr/static").as("ssr")
    cy.visit("routes/ssr/static")

    checkHeaders("@ssr", {
      ...defaultHeaders,
      "x-ssr-header": "my custom header value from config",
    })
  })

  it("should contain correct headers for dsg page", () => {
    cy.intercept("routes/dsg/static").as("dsg")
    cy.visit("routes/dsg/static")

    checkHeaders("@dsg", {
      ...defaultHeaders,
      "x-dsg-header": "my custom header value",
    })
  })
})
