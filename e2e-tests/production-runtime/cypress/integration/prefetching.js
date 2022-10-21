Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`Prefetching`, () => {
  if (Cypress.env(`CONNECTION_TYPE`) === `bot`) {
    it(`should not prefetch if Googlebot`, () => {
      cy.visit(`/`).waitForRouteChange()

      cy.window().then(async win => {
        const isPrefetching = await win.___loader.enqueue(`/page-2`)
        expect(isPrefetching).to.equal(false)
      })

      cy.get(`link[rel="prefetch"]`).should(`not.exist`)
      cy.lifecycleCallCount(`onPrefetchPathname`).should(`equal`, 0)
    })
  } else {
    it(`should prefetch`, () => {
      cy.visit(`/`).waitForRouteChange()

      cy.window().then(async win => {
        const isPrefetching = await win.___loader.enqueue(`/page-2`)
        expect(isPrefetching).to.equal(true)
      })

      cy.get(`link[rel="prefetch"]`).should(`exist`)
      cy.lifecycleCallCount(`onPrefetchPathname`).should(`not.equal`, 0)
    })
  }
})
