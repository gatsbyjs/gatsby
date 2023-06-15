describe('Sub-Router', () => {
  const routes = [
    {
      path: "/routes/sub-router",
      marker: "index",
      label: "Index route"
    },
    {
      path: `/routes/sub-router/page/profile`,
      marker: `profile`,
      label: `Dynamic route`,
    },
    {
      path: `/routes/sub-router/not-found`,
      marker: `NotFound`,
      label: `Default route (not found)`,
    },
    {
      path: `/routes/sub-router/nested`,
      marker: `nested-page/index`,
      label: `Index route inside nested router`,
    },
    {
      path: `/routes/sub-router/nested/foo`,
      marker: `nested-page/foo`,
      label: `Dynamic route inside nested router`,
    },
    {
      path: `/routes/sub-router/static`,
      marker: `static-sibling`,
      label: `Static route that is a sibling to client only path`,
    },
  ]

  routes.forEach(({ path, marker, label }) => {
    it(label, () => {
      cy.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('Minified React error')) {
          return false
        }
      })
      cy.visit(path).waitForRouteChange()
      cy.get(`[data-testid="dom-marker"]`).contains(marker)

      cy.url().should(
        `match`,
        new RegExp(`^${Cypress.config().baseUrl + path}/?$`)
      )
    })
  })
})

describe('Paths', () => {
  // TODO
})