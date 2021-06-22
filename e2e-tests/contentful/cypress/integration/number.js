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
  it(`number: Decimal Localized`, () => {
    cy.get(
      '[data-cy-id="english-number-decimal-localized"] [data-cy-value]'
    ).should("have.text", "76.26")
    cy.get(
      '[data-cy-id="german-number-decimal-localized"] [data-cy-value]'
    ).should("have.text", "95.31")
  })
  it(`number: Integer Localized`, () => {
    cy.get(
      '[data-cy-id="english-number-integer-localized"] [data-cy-value]'
    ).should("have.text", "8673000")
    cy.get(
      '[data-cy-id="german-number-integer-localized"] [data-cy-value]'
    ).should("have.text", "6046000")
  })
})
