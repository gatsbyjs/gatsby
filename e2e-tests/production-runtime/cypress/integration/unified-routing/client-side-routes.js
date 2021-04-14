describe(`client-side-routing`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`supports dynamic url segments`, () => {
    cy.visit(`/client-dynamic-route/foo`).waitForRouteChange()

    cy.getTestElement(`params`).invoke(`text`).should(`equal`, `foo`)
  })

  it(`supports splats`, () => {
    cy.visit(`/client-dynamic-route/splat/blah/blah/blah`).waitForRouteChange()

    cy.getTestElement(`splat`).invoke(`text`).should(`equal`, `blah/blah/blah`)
  })
})
