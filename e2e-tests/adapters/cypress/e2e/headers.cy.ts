import { WorkaroundCachedResponse } from "../utils/dont-cache-responses-in-browser"

describe("Headers", () => {
  // `ntl serve` and actual deploy seem to have possible slight differences around header value formatting
  // so this just remove spaces around commas to make it easier to compare
  function normalizeHeaderValue(value: string | undefined): string | undefined {
    if (typeof value === "undefined") {
      return value
    }
    // Remove spaces around commas
    return value.replace(/\s*,\s*/gm, `,`)
  }
  function checkHeaders(routeAlias, expectedHeaders) {
    cy.wait(routeAlias).then(interception => {
      Object.keys(expectedHeaders).forEach(headerKey => {
        const headers = interception.response.headers[headerKey]

        const firstHeader: string = Array.isArray(headers)
          ? headers[0]
          : headers

        expect(normalizeHeaderValue(firstHeader)).to.eq(
          normalizeHeaderValue(expectedHeaders[headerKey])
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

  beforeEach(() => {
    cy.intercept("/").as("index")
    cy.intercept("/static/astro-**.png", WorkaroundCachedResponse).as(
      "img-import"
    )
    cy.intercept("routes/ssr/static").as("ssr")
    cy.intercept("routes/dsg/static").as("dsg")
  })

  it("should contain correct headers for index page", () => {
    cy.visit("/")

    checkHeaders("@index", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "cache-control": "public,max-age=0,must-revalidate",
    })
  })

  it("should contain correct headers for static assets", () => {
    cy.visit("/")

    checkHeaders("@img-import", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "cache-control": "public,max-age=31536000,immutable",
    })
  })

  it("should contain correct headers for ssr page", () => {
    cy.visit("routes/ssr/static")

    checkHeaders("@ssr", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "x-ssr-header": "my custom header value from config",
      "x-ssr-header-getserverdata": "my custom header value from getServerData",
      "x-ssr-header-overwrite": "getServerData wins",
    })
  })

  it("should contain correct headers for dsg page", () => {
    cy.visit("routes/dsg/static")

    checkHeaders("@dsg", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "x-dsg-header": "my custom header value",
    })
  })
})
