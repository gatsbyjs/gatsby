import { applyTrailingSlashOption } from "../../utils"

/**
 * Netlify-specific: these assertions are about how the CDN treats the engine's
 * page responses, so they live outside `cypress/e2e` and only run via
 * `cypress/configs/netlify.ts`. An external adapter copying this suite does not
 * inherit them.
 *
 * They assert the observable outcome - what the CDN does - rather than the
 * directive the adapter sets, so they hold for any mechanism that gets deferred
 * pages cached and keeps SSR pages out of the cache.
 *
 * Two caches report in `cache-status`, and which one serves a cached response is
 * not fixed: a warm edge node answers before the durable cache is consulted, and
 * then only its entry is reported. So "was cached" means a hit from either. Not
 * being cached at all is specific though - the durable cache says so explicitly.
 */

const TRAILING_SLASH = Cypress.env(`TRAILING_SLASH`) || `never`

const DSG_ROUTE = `/routes/dsg/static`
const SSR_ROUTE = `/routes/ssr/static`

// `baseUrl` already carries the path prefix - the deploy script bakes it into
// DEPLOY_URL - so these are relative to it and must not add it again.
function routeUrl(route: string): string {
  return applyTrailingSlashOption(route, TRAILING_SLASH)
}

describe(`CDN caching`, () => {
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
