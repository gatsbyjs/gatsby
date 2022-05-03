describe('gatsby-types.d.ts', () => {
  it('exists in src folder', () => {
    cy.readFile('src/gatsby-types.d.ts')
  })
})