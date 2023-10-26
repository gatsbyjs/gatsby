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

  it("should contain correct headers for index page and static assets", () => {
    cy.intercept("/").as("index")
    cy.visit("/")

    checkHeaders("@index", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
    })
  })

  //   it("should contain correct headers for static assets", () => {
  //     cy.intercept("/static/astro-5459bfacab7ae1bcfb22dc9100754547.png").as(
  //       "img-import"
  //     )
  //     cy.visit("/static/astro-5459bfacab7ae1bcfb22dc9100754547.png")

  //     checkHeaders("@img-import", {
  //       ...defaultHeaders,
  //       "cache-control": "public, max-age=31536000, immutable",
  //     })
  //   })

  it("should contain correct headers for ssr page", () => {
    cy.intercept("/ssr/static").as("ssr")
    cy.visit("/ssr/static")

    checkHeaders("@ssr", {
      ...defaultHeaders,
      "x-ssr-header": "my custom header value from config",
    })
  })

  it("should contain correct headers for dsg page", () => {
    cy.intercept("/dsg/static").as("dsg")
    cy.visit("/dsg/static")

    checkHeaders("@dsg", {
      ...defaultHeaders,
      "x-dsg-header": "my custom header value",
    })
  })
})
