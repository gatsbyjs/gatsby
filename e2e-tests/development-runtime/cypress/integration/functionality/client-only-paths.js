describe(`client-only-paths`, () => {
  const routes = [
    {
      path: `/client-only-paths/`,
      marker: `index`,
      label: `Index route`,
    },
    {
      path: `/client-only-paths/page/profile`,
      marker: `profile`,
      label: `Dynamic route`,
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
      path: `/client-only-paths/not-found`,
      marker: `NotFound`,
      label: `Default route (not found)`,
    },
  ]

  describe(`First paint`, () => {
    routes.forEach(({ path, marker, label }) => {
      it(label, () => {
        cy.visit(path).waitForRouteChange()
        cy.getTestElement(`dom-marker`).contains(marker)
      })
    })
  })

  describe(`Can navigate to path`, () => {
    beforeEach(() => {
      cy.visit(`/`).waitForRouteChange()
    })
    routes.forEach(({ path, marker, label }) => {
      it(label, () => {
        cy.navigateAndWaitForRouteChange(path)
        cy.getTestElement(`dom-marker`).contains(marker)
      })
    })
  })
})
