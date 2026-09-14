import { applyTrailingSlashOption } from "../../utils"

/**
 * Netlify-specific: these assertions are about what `gatsby-adapter-netlify` does
 * with the engine's page responses, so they live outside `cypress/e2e` and only run
 * via `cypress/configs/netlify.ts`. An external adapter copying this suite does not
 * inherit them.
 *
 * This is the one place the whole chain is exercised on a real deploy: the engine
 * marking a response cacheable, the adapter turning that into a CDN directive, and
 * the CDN acting on it.
 */

const TRAILING_SLASH = Cypress.env(`TRAILING_SLASH`) || `never`

// The CDN consumes and strips the cache-control directive. Requesting debug
// logging returns the stripped headers renamed with a `debug-` prefix, so the
// origin's directive is observable there and nowhere else.
const DEBUG_HEADERS = { "x-nf-debug-logging": "1" }

const DSG_ROUTE = `/routes/dsg/static`
const SSR_ROUTE = `/routes/ssr/static`

// `baseUrl` already carries the path prefix - the deploy script bakes it into
// DEPLOY_URL - so these are relative to it and must not add it again.
function routeUrl(route: string): string {
  return applyTrailingSlashOption(route, TRAILING_SLASH)
}

describe(`CDN caching`, () => {
  describe(`netlify-cdn-cache-control`, () => {
    it(`marks a DSG page as cacheable`, () => {
      cy.request({ url: routeUrl(DSG_ROUTE), headers: DEBUG_HEADERS }).then(
        response => {
          expect(
            String(response.headers[`debug-netlify-cdn-cache-control`] ?? ``)
          ).to.equal(`public, s-maxage=31536000, must-revalidate, durable`)
        }
      )
    })

    it(`marks DSG page-data as cacheable`, () => {
      cy.request({
        url: `/page-data/routes/dsg/static/page-data.json`,
        headers: DEBUG_HEADERS,
      }).then(response => {
        expect(
          String(response.headers[`debug-netlify-cdn-cache-control`] ?? ``)
        ).to.equal(`public, s-maxage=31536000, must-revalidate, durable`)
      })
    })

    it(`does not mark an SSR page as cacheable`, () => {
      cy.request({ url: routeUrl(SSR_ROUTE), headers: DEBUG_HEADERS }).then(
        response => {
          expect(
            String(response.headers[`debug-netlify-cdn-cache-control`] ?? ``)
          ).to.equal(``)
        }
      )
    })
  })

  /*
    Two caches report here, and which one serves a cached response is not fixed:
    a warm edge node answers before the durable cache is consulted, and then only
    its entry is reported. So "was cached" means a hit from either. Not being
    cached at all is specific though - the durable cache says so explicitly.
  */
  describe(`cache-status`, () => {
    it(`serves a DSG page from cache on a repeat request`, () => {
      const url = routeUrl(DSG_ROUTE)

      cy.request(url)
      cy.request(url).then(response => {
        expect(String(response.headers[`cache-status`] ?? ``)).to.match(
          /"Netlify (Durable|Edge)"; hit/
        )
      })
    })

    it(`serves a DSG page from cache, regardless of query params`, () => {
      const url = routeUrl(DSG_ROUTE)

      cy.request(url)
      cy.request(`${url}?not-part-of-the-cache-key=${Date.now()}`).then(
        response => {
          expect(String(response.headers[`cache-status`] ?? ``)).to.match(
            /"Netlify (Durable|Edge)"; hit/
          )
        }
      )
    })

    it(`does not serve an SSR page from cache`, () => {
      const url = routeUrl(SSR_ROUTE)

      cy.request(url)
      cy.request(url).then(response => {
        expect(String(response.headers[`cache-status`] ?? ``)).to.contain(
          `"Netlify Durable"; fwd=bypass`
        )
      })
    })
  })
})
