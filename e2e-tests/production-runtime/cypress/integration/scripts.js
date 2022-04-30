describe(`Preloads`, () => {
  it(`should not have page scripts in HTML`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`body script`).each(script => {
      cy.wrap(script).should(`not.have.attr`, `src`, /component---/)
    })
  })
})
