describe(`number`, () => {
  beforeEach(() => {
    cy.visit("/number").waitForRouteChange()
  })
  it(`number: Decimal`, () => {
    cy.get('[data-cy-id="number-decimal"] [data-cy-value]').should(
      "have.text",
      "4.2"
    )
  })
  it(`number: Integer`, () => {
    cy.get('[data-cy-id="number-integer"] [data-cy-value]').should(
      "have.text",
      "42"
    )
  })
})
