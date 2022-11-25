describe(`both onLoad and onError callbacks are declared`, () => {
  beforeEach(() => {
    cy.visit(`/gatsby-script-both-callbacks/`).waitForRouteChange()
  })

  it(`should execute the onLoad callback`, () => {
    cy.get(`[data-on-load-result=both-callbacks]`).should(`have.length`, 1)
  })

  it(`should execute the onError callback`, () => {
    cy.get(`[data-on-error-result=both-callbacks]`).should(`have.length`, 1)
  })
})
