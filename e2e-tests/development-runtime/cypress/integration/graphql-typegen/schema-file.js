describe('schema.graphql', () => {
  it('exists in .cache folder', () => {
    cy.readFile('.cache/typegen/schema.graphql')
  })
})