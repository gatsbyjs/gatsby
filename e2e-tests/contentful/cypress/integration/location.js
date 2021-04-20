describe(`location`, () => {
  beforeEach(() => {
    cy.visit("/location")
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
})
