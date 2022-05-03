describe('graphql-config', () => {
  it('exists in .cache folder with correct data', () => {
    cy.readFile('.cache/typegen/graphql.config.json', 'utf-8').then((json) => {
      expect(json).to.deep.equal({
        "schema": ".cache/typegen/schema.graphql",
        "documents": [
          "src/**/**.{ts,js,tsx,jsx}",
          ".cache/typegen/fragments.graphql"
        ],
        "extensions": {
          "endpoints": {
            "default": {
              "url": "http://localhost:8000/___graphql"
            }
          }
        }
      })
    })
  })
})