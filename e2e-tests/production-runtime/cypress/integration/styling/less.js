describe(`styling: less`, () => {
  it(`initial styling is correct`, () => {
    cy.visit(`/styling/less`).waitForRouteChange()

    cy.getTestElement(`less-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )

    cy.getTestElement(`less-module-styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })
})
