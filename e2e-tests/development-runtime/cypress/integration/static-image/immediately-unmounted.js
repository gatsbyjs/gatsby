describe(`immediately unmounted`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/immediately-unmounted`)
  })

  it(`should not error`, () => {
    cy.assertNoFastRefreshOverlay()
  })
})
