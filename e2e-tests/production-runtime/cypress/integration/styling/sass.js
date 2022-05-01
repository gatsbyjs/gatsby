describe(`styling: sass`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/sass`).waitForRouteChange()

    cy.getTestElement(`sass-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`sass-module-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })
})
