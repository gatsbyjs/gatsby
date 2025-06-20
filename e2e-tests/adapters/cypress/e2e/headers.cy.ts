import { applyTrailingSlashOption } from "../../utils"
import { CyHttpMessages } from "cypress/types/net-stubbing"

import { WorkaroundCachedResponse } from "../utils/dont-cache-responses-in-browser"

const TRAILING_SLASH = Cypress.env(`TRAILING_SLASH`) || `never`
const PATH_PREFIX = Cypress.env(`PATH_PREFIX`) || ``

const WorkaroundHtmlCachedResponse = (
  req: CyHttpMessages.IncomingHttpRequest
): void | Promise<void> => {
  // make sure we use cache workaround
  WorkaroundCachedResponse(req)

  // this is forcing html request to skip potential trailing slash redirect
  // ideally cy.visit() url would already do that, but for index page it will always force
  // trailing slash, so instead we apply it here, when url is fully formed
  // otherwise cy.wait would get redirect response and assert headers of that,
  // which is not what we want and because tests are parametrized, it would be messy
  // to conditionally do `cy.wait()` multiple times to get actual html response
  req.url = applyTrailingSlashOption(req.url, TRAILING_SLASH)
}

describe("Headers", () => {
  const defaultHeaders = {
    "x-xss-protection": "1; mode=block",
    "x-content-type-options": "nosniff",
    "referrer-policy": "same-origin",
    "x-frame-options": "DENY",
  }

  // DRY for repeated assertions in multple tests
  const expectedHeadersByRouteAlias = {
    "@app-data": {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    },
    "@page-data": {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    },
    "@slice-data": {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    },
    "@static-query-result": {
      ...defaultHeaders,
      "cache-control": "public,max-age=0,must-revalidate",
    },
    "@img-webpack-import": {
      ...defaultHeaders,
      "cache-control": "public,max-age=31536000,immutable",
    },
    "@js": {
      ...defaultHeaders,
      "cache-control": "public,max-age=31536000,immutable",
    },
  }

  // `ntl serve` and actual deploy seem to have possible slight differences around header value formatting
  // so this just remove spaces around commas to make it easier to compare
  function normalizeHeaderValue(value: string | undefined): string | undefined {
    if (typeof value === "undefined") {
      return value
    }
    // Remove spaces around commas
    return value.replace(/\s*,\s*/gm, `,`)
  }
  function checkHeaders(
    routeAlias: string,
    expectedHeaders?: Record<string, string>
  ) {
    if (!expectedHeaders) {
      expectedHeaders = expectedHeadersByRouteAlias[routeAlias]
    }

    if (!expectedHeaders) {
      throw new Error(`No expected headers provided for "${routeAlias}`)
    }

    cy.wait(routeAlias).then(interception => {
      console.log("Intercepted", {
        routeAlias,
        request: {
          url: interception.request.url,
        },
        response: {
          status: interception.response.statusCode,
          headers: interception.response.headers,
        },
      })

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

  beforeEach(() => {
    cy.intercept(PATH_PREFIX + "/", WorkaroundHtmlCachedResponse).as("index")
    cy.intercept(
      PATH_PREFIX + "/routes/ssg/static",
      WorkaroundHtmlCachedResponse
    ).as("ssg")
    cy.intercept(
      PATH_PREFIX + "/routes/ssr/static",
      WorkaroundHtmlCachedResponse
    ).as("ssr")
    cy.intercept(
      PATH_PREFIX + "/routes/dsg/static",
      WorkaroundHtmlCachedResponse
    ).as("dsg")

    cy.intercept(
      PATH_PREFIX + "/**/page-data.json",
      WorkaroundCachedResponse
    ).as("page-data")
    cy.intercept(
      PATH_PREFIX + "/**/app-data.json",
      WorkaroundCachedResponse
    ).as("app-data")
    cy.intercept(
      PATH_PREFIX + "/**/slice-data/*.json",
      WorkaroundCachedResponse
    ).as("slice-data")
    cy.intercept(
      PATH_PREFIX + "/**/page-data/sq/d/*.json",
      WorkaroundCachedResponse
    ).as("static-query-result")

    cy.intercept(
      PATH_PREFIX + "/static/astro-**.png",
      WorkaroundCachedResponse
    ).as("img-webpack-import")
    cy.intercept(PATH_PREFIX + "/**/*.js", WorkaroundCachedResponse).as("js")
  })

  it("should contain correct headers for index page", () => {
    cy.visit("/").waitForRouteChange()

    checkHeaders("@index", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "cache-control": "public,max-age=0,must-revalidate",
    })

    checkHeaders("@app-data")
    checkHeaders("@page-data")
    checkHeaders("@slice-data")
    checkHeaders("@static-query-result")

    // index page is only one showing webpack imported image
    checkHeaders("@img-webpack-import")
    checkHeaders("@js")
  })

  it("should contain correct headers for ssg page", () => {
    cy.visit("routes/ssg/static").waitForRouteChange()

    checkHeaders("@ssg", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "x-ssg-header": "my custom header value",
      "cache-control": "public,max-age=0,must-revalidate",
    })

    checkHeaders("@app-data")
    checkHeaders("@page-data")
    checkHeaders("@slice-data")
    checkHeaders("@static-query-result")
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

    checkHeaders("@app-data")
    // page-data is baked into SSR page so it's not fetched and we don't assert it
    checkHeaders("@slice-data")
    checkHeaders("@static-query-result")
    checkHeaders("@js")
  })

  it("should contain correct headers for dsg page", () => {
    cy.visit("routes/dsg/static").waitForRouteChange()

    checkHeaders("@dsg", {
      ...defaultHeaders,
      "x-custom-header": "my custom header value",
      "x-dsg-header": "my custom header value",
    })

    checkHeaders("@app-data")
    checkHeaders("@page-data")
    checkHeaders("@slice-data")
    checkHeaders("@static-query-result")
    checkHeaders("@js")
  })
})
