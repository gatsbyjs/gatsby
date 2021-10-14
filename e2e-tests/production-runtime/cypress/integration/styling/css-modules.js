describe(`styling: css modules`, () => {
  beforeEach(() => {
    cy.visit(`/styling/css-modules`).waitForRouteChange()
  })

  it(`initial styling is correct`, () => {
    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(0, 128, 0)`
    )
  })
})
