describe(`Preloads`, () => {
  it(`should not have preloads in head`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`head link[rel="preload"]`).should("not.exist")
  })
})
