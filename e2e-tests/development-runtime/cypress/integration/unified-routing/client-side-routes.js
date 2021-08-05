describe(`client-side-routing`, () => {
  it(`supports dynamic url segments`, () => {
    cy.visit(`/client-dynamic-route/foo`).waitForRouteChange()

    cy.findByTestId(`params`)
    cy.should(`have.text`, `foo`)
  })

  it(`supports nested dynamic url segments`, () => {
    cy.visit(`/client-dynamic-route/products/incite/holo-lens`).waitForRouteChange()

    cy.findByTestId(`params-brand`)
    cy.should(`have.text`, `incite`)
    cy.findByTestId(`params-product`)
    cy.should(`have.text`, `holo-lens`)
  })

  it(`supports splats`, () => {
    cy.visit(`/client-dynamic-route/splat/blah/blah/blah`).waitForRouteChange()

    cy.findByTestId(`splat`)
    cy.should(`have.text`, `blah/blah/blah`)
  })

  it(`supports named splats`, () => {
    cy.visit(`/client-dynamic-route/named-splat/dolores`).waitForRouteChange()

    cy.findByTestId(`splat`)
    cy.should(`have.text`, `dolores`)
    cy.findByTestId(`title`)
    cy.should(`have.text`, `Named SPLAT`)
  })
})
