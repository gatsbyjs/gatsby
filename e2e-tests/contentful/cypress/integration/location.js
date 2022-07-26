describe(`location`, () => {
  beforeEach(() => {
    cy.visit("/location").waitForRouteChange()
  })
  it(`location`, () => {
    cy.get('[data-cy-id="location"] [data-cy-value-lat]').should(
      "have.text",
      "52.51627"
    )
    cy.get('[data-cy-id="location"] [data-cy-value-lon]').should(
      "have.text",
      "13.3777"
    )
  })
  it(`location localized`, () => {
    cy.get('[data-cy-id="english"] [data-cy-value-lat]').should(
      "have.text",
      "37.79176"
    )
    cy.get('[data-cy-id="english"] [data-cy-value-lon]').should(
      "have.text",
      "-122.393"
    )
    cy.get('[data-cy-id="german"] [data-cy-value-lat]').should(
      "have.text",
      "52.53907"
    )
    cy.get('[data-cy-id="german"] [data-cy-value-lon]').should(
      "have.text",
      "13.38405"
    )
  })
})
