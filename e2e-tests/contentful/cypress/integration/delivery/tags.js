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
    cy.get('[data-cy-id^="tag-"]').should("have.length", 5)
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
  it(`Assets`, () => {
    cy.get('[data-cy-assets] [data-cy-id="example-cat"]').should(
      "have.length",
      1
    )
    cy.get('[data-cy-assets] [data-cy-id="example-cat"] [data-cy-value]')
      .should("contain", "Animal")
      .should("contain", "Cat")

    cy.get('[data-cy-assets] [data-cy-id="example-dog"]').should(
      "have.length",
      1
    )
    cy.get('[data-cy-assets] [data-cy-id="example-dog"] [data-cy-value]')
      .should("contain", "Animal")
      .should("contain", "Dog")
  })
})
