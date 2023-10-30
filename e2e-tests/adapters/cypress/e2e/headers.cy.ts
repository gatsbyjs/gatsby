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
    cy.intercept("/", WorkaroundCachedResponse).as("index")
    cy.intercept("**/page-data.json", WorkaroundCachedResponse).as("page-data")
    cy.intercept("**/app-data.json", WorkaroundCachedResponse).as("app-data")
    cy.intercept("/static/astro-**.png", WorkaroundCachedResponse).as(
      "img-import"
    )
    cy.intercept("routes/ssr/static", WorkaroundCachedResponse).as("ssr")
    cy.intercept("routes/dsg/static", WorkaroundCachedResponse).as("dsg")
  })

  it("should contain correct headers for index page", () => {
    cy.visit("/").waitForRouteChange()

    checkHeaders("@index", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "cache-control": "public,max-age=0,must-revalidate",
    })

    checkHeaders("@app-data", {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    })

    checkHeaders("@page-data", {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    })

    checkHeaders("@img-import", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "cache-control": "public,max-age=31536000,immutable",
    })
  })

  it("should contain correct headers for ssr page", () => {
    cy.visit("routes/ssr/static").waitForRouteChange()

    checkHeaders("@ssr", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "x-ssr-header": "my custom header value from config",
      "x-ssr-header-getserverdata": "my custom header value from getServerData",
      "x-ssr-header-overwrite": "getServerData wins",
    })

    checkHeaders("@app-data", {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    })

    // page-data is baked into SSR page so it's not fetched and we don't assert it
  })

  it("should contain correct headers for dsg page", () => {
    cy.visit("routes/dsg/static").waitForRouteChange()

    checkHeaders("@dsg", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "x-dsg-header": "my custom header value",
    })

    checkHeaders("@app-data", {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    })

    checkHeaders("@page-data", {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    })
  })
})
