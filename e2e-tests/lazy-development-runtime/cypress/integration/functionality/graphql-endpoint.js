const endpoints = [`/___graphql`, `/_graphql`, `/___graphiql`]

const testQueryString = `?query=${encodeURIComponent(`{
  site {
    siteMetadata {
      title
    }
  }
}`)}`

describe(`The GraphQL endpoint`, () => {
  endpoints.forEach(endpoint => {
    it(`Should appear on ${endpoint}`, () => {
      cy.visit(endpoint)
      cy.get(`.graphiql-container`).should(`be.visible`)
      cy.title().should(`eq`, `GraphiQL`)
    })

    it(`Should execute queries from query string on ${endpoint}`, () => {
      // prefill query from query string
      cy.visit(endpoint + testQueryString)
      cy.get(`.graphiql-container`).should(`be.visible`)
      cy.get(`.execute-button`).click()
      cy.get(`.result-window .CodeMirror-code`).contains(
        `Gatsby Default Starter`
      )
    })

    it(`Should execute queries created with explorer on ${endpoint}`, () => {
      // hack to show (almost) empty editor instead of
      cy.visit(endpoint + `?query=%20`)
      cy.get(`.graphiql-container`).should(`be.visible`)
      cy.get(`[data-field-name="site"]`).click()
      cy.get(`[data-field-name="port"]`).click()
      cy.get(`.execute-button`).click()
      cy.get(`.result-window .CodeMirror-code`).contains(`8000`)
    })
  })
})
