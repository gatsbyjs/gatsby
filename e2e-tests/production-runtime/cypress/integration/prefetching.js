describe(`Prefetching`, () => {
  if (Cypress.env(`CONNECTION_TYPE`) === `slow`) {
    it(`should not prefetch if on slow connection`, () => {
      cy.visit(`/`).waitForAPI(`onRouteUpdate`)

      cy.window().then(async win => {
        const isPrefetching = await win.___loader.enqueue(`/page-2`)
        expect(isPrefetching).to.equal(false)
      })

      cy.get(`link[rel="prefetch"]`).should(`not.exist`)
      cy.lifecycleCallCount(`onPrefetchPathname`).should(`equal`, 0)
    })
  } else {
    it(`should prefetch`, () => {
      cy.visit(`/`).waitForAPI(`onRouteUpdate`)

      cy.window().then(async win => {
        const isPrefetching = await win.___loader.enqueue(`/page-2`)
        expect(isPrefetching).to.equal(true)
      })

      cy.get(`link[rel="prefetch"]`).should(`exist`)
      cy.lifecycleCallCount(`onPrefetchPathname`).should(`not.equal`, 0)
    })
  }
})
