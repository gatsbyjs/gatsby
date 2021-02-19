describe(`styling: plain css`, () => {
  beforeEach(() => {
    cy.visit(`/styling/plain-css`).waitForRouteChange()
  })

  it(`initial styling is correct`, () => {
    cy.getTestElement(`styled-element`).should(
      `have.css`,
      `color`,
      `rgb(255, 0, 0)`
    )
  })
})
