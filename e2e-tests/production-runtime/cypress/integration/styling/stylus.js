describe(`stylineg: stylus`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/stylus`).waitForRouteChange()

    cy.getTestElement(`stylus-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`stylus-module-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })
})
