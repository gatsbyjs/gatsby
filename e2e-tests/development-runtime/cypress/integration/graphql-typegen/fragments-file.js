describe('fragments.graphql', () => {
  it('exists in .cache folder', () => {
    cy.readFile('.cache/typegen/fragments.graphql')
  })
})