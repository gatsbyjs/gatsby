const testQueryString = `?query=${encodeURIComponent(`{
  site {
    ...TestingFragment
  }
}`)}`

describe(`The GraphQL endpoint`, () => {
  it(`Should execute operations with implicit fragments`, () => {
    // prefill query from query string
    cy.visit(`/___graphql` + testQueryString)
    cy.get(`.graphiql-container`).should(`be.visible`)
    cy.get(`.graphiql-execute-button`).click()
    cy.get(`.result-window .CodeMirror-code`).contains(`@gatsbyjs`)
  })
})
