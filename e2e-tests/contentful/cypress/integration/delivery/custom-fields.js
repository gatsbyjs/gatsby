describe(`custom-fields`, () => {
  beforeEach(() => {
    cy.visit("/custom-fields").waitForRouteChange()
  })

  it(`custom-fields: custom field`, () => {
    cy.get(`[data-cy-id="field"] [data-cy-value]`).should(
      `have.text`,
      `customFieldValue`
    )
  })

  it(`custom-fields: custom resolver`, () => {
    cy.get(`[data-cy-id="resolver"] [data-cy-value]`).should(
      `have.text`,
      `customResolverResult`
    )
  })
})
