Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Client only paths`, () => {
  const routes = [
    {
      path: `/client-only-paths`,
      marker: `index`,
      label: `Index route`,
    },
    {
      path: `/client-only-paths/page/profile`,
      marker: `profile`,
      label: `Dynamic route`,
    },
    {
      path: `/client-only-paths/not-found`,
      marker: `NotFound`,
      label: `Default route (not found)`,
    },
    {
      path: `/client-only-paths/nested`,
      marker: `nested-page/index`,
      label: `Index route inside nested router`,
    },
    {
      path: `/client-only-paths/nested/foo`,
      marker: `nested-page/foo`,
      label: `Dynamic route inside nested router`,
    },
    {
      path: `/client-only-paths/static`,
      marker: `static-sibling`,
      label: `Static route that is a sibling to client only path`,
    },
    {
      path: `/app`,
      marker: `app-index-1`,
      label: `Prioritize static page over matchPath page with wildcard (static page created before matchPath page)`,
    },
    {
      path: `/app2`,
      marker: `app-index-2`,
      label: `Prioritize static page over matchPath page with wildcard (static page created after matchPath page)`,
    },
    {
      path: `/app/foo`,
      marker: `app-wildcard-1`,
      label: `Can navigate to matchPath page with wildcard #1`,
    },
    {
      path: `/app2/foo`,
      marker: `app-wildcard-2`,
      label: `Can navigate to matchPath page with wildcard #2`,
    },
    {
      path: `/event/2019/10/26/test-event`,
      marker: `static-event-1`,
      label: `Prioritize static page over matchPath page with named parameters (static page created before matchPath page)`,
    },
    {
      path: `/event/2019/10/28/test-event`,
      marker: `static-event-2`,
      label: `Prioritize static page over matchPath page with named parameters (static page created after matchPath page)`,
    },
    {
      path: `/event/2019/10/27/test-event`,
      marker: `dynamic-event`,
      label: `Prioritize matchPath page with named parameters over matchPath page with wildcard`,
    },
    {
      path: `/event/2019/10/foo`,
      marker: `dynamic-and-wildcard`,
      label: `Can navigate to matchPath page with mix of named parameters and wildcard`,
    },
  ]

  describe(`work on first load`, () => {
    routes.forEach(({ path, marker, label, skipTestingExactLocation }) => {
      it(label, () => {
        cy.on('uncaught:exception', (err, runnable) => {
          if (err.message.includes('Minified React error')) {
            return false
          }
        })
        cy.visit(path).waitForRouteChange()
        cy.getTestElement(`dom-marker`).contains(marker)

        // `serve-static` (used by `gatsby serve`) is doing some redirects when
        // navigating to static pages to always include trailing slash.
        // We want to pass this check if trailing slash is added.
        cy.url().should(
          `match`,
          new RegExp(`^${Cypress.config().baseUrl + path}/?$`)
        )
      })
    })
  })

  describe(`work on client side navigation`, () => {
    beforeEach(() => {
      cy.visit(`/`).waitForRouteChange()
    })
    routes.forEach(({ path, marker, label }) => {
      it(label, () => {
        cy.navigateAndWaitForRouteChange(path)
        cy.getTestElement(`dom-marker`).contains(marker)
        cy.url().should(`eq`, Cypress.config().baseUrl + path)
      })
    })
  })
})
