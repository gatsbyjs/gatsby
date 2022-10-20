describe(`Client only paths`, () => {
  const routes = [
    {
      path: `/client-only-paths/`,
      marker: `index`,
      label: `Index route`,
    },
    {
      path: `/client-only-paths/page/profile/`,
      marker: `profile`,
      label: `Dynamic route`,
    },
    {
      path: `/client-only-paths/not-found/`,
      marker: `NotFound`,
      label: `Default route (not found)`,
    },
    {
      path: `/client-only-paths/nested/`,
      marker: `nested-page/index`,
      label: `Index route inside nested router`,
    },
    {
      path: `/client-only-paths/nested/foo/`,
      marker: `nested-page/foo`,
      label: `Dynamic route inside nested router`,
    },
    {
      path: `/client-only-paths/static/`,
      marker: `static-sibling`,
      label: `Static route that is a sibling to client only path`,
    },
  ]

  describe(`work on first load`, () => {
    routes.forEach(({ path, marker, label }) => {
      it(label, () => {
        cy.visit(path).waitForRouteChange()
        cy.getTestElement(`dom-marker`).contains(marker)
        cy.url().should(`eq`, Cypress.config().baseUrl + path)
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
