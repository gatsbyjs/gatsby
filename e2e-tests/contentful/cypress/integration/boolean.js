describe(`boolean`, () => {
  beforeEach(() => {
    cy.visit("/boolean").waitForRouteChange()
  })
  it(`boolean: No`, () => {
    cy.get('[data-cy-id="default-boolean-no"] [data-cy-value]').should(
      "have.text",
      "false"
    )
  })
  it(`boolean: Null`, () => {
    cy.get('[data-cy-id="default-boolean-null"] [data-cy-value]').should(
      "have.text",
      "null"
    )
  })
  it(`boolean: Yes`, () => {
    cy.get('[data-cy-id="default-boolean-yes"] [data-cy-value]').should(
      "have.text",
      "true"
    )
  })
})
describe(`boolean localized`, () => {
  beforeEach(() => {
    cy.visit("/boolean").waitForRouteChange()
  })
  it(`boolean localized: English`, () => {
    cy.get('[data-cy-id="english-boolean-localized"] [data-cy-value]').should(
      "have.text",
      "true"
    )
  })
  it(`boolean localized: German`, () => {
    cy.get('[data-cy-id="german-boolean-localized"] [data-cy-value]').should(
      "have.text",
      "false"
    )
  })
})
