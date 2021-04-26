describe(`boolean`, () => {
  beforeEach(() => {
    cy.visit("/boolean").waitForRouteChange()
  })
  it(`boolean: No`, () => {
    cy.get('[data-cy-id="boolean-no"] [data-cy-value]').should(
      "have.text",
      "false"
    )
  })
  it(`boolean: Null`, () => {
    cy.get('[data-cy-id="boolean-null"] [data-cy-value]').should(
      "have.text",
      "null"
    )
  })
  it(`boolean: Yes`, () => {
    cy.get('[data-cy-id="boolean-yes"] [data-cy-value]').should(
      "have.text",
      "true"
    )
  })
})
