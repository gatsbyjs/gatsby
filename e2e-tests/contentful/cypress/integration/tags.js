describe(`tags`, () => {
  beforeEach(() => {
    cy.visit("/tags").waitForRouteChange()
  })
  it(`Tag list`, () => {
    cy.get('[data-cy-id="tag-numberDecimal"] [data-cy-name]').should(
      "have.text",
      "Number: Decimal"
    )
    cy.get('[data-cy-id="tag-numberDecimal"] [data-cy-id]').should(
      "have.text",
      "numberDecimal"
    )
    cy.get('[data-cy-id="tag-numberInteger"] [data-cy-name]').should(
      "have.text",
      "Number: Integer"
    )
    cy.get('[data-cy-id="tag-numberInteger"] [data-cy-id]').should(
      "have.text",
      "numberInteger"
    )
    cy.get('[data-cy-id^="tag-"]').should("have.length", 2)
  })
  it(`Filtered Entries`, () => {
    cy.get('[data-cy-integers] [data-cy-id="number-integer"]').should(
      "have.length",
      1
    )
    cy.get(
      '[data-cy-integers] [data-cy-id="number-integer"] [data-cy-value]'
    ).should("have.text", 42)

    cy.get('[data-cy-decimals] [data-cy-id="number-decimal"]').should(
      "have.length",
      1
    )
    cy.get(
      '[data-cy-decimals] [data-cy-id="number-decimal"] [data-cy-value]'
    ).should("have.text", 4.2)
  })
})
