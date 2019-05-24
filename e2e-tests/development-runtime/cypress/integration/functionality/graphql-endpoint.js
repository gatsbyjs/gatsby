const endpoints = [`/___graphql`, `/_graphql`, `/___graphiql`]

const testQuery = `{
  site {
    siteMetadata {
      title
    }
  }
}`

describe(`The GraphQL endpoint`, () => {
  endpoints.forEach(endpoint => {
    it(`Should appear on ${endpoint}`, () => {
      cy.visit(endpoint)
      cy.title().should(`eq`, `GraphiQL`)
    })

    it(`Should execute queries entered in editor on ${endpoint}`, () => {
      // hack to show (almost) empty editor instead of
      cy.visit(endpoint + `?query=%20`)
      cy.get(`.query-editor textarea`).type(testQuery, {
        force: true,
      })
      cy.get(`.execute-button`).click()
      // result have title
      cy.get(`.result-window .CodeMirror-code`).contains(
        `Gatsby Default Starter`
      )
    })

    it(`Should execute queries created with explorer on  ${endpoint}`, () => {
      // hack to show (almost) empty editor instead of
      cy.visit(endpoint + `?query=%20`)
      cy.get(`[data-field-name="site"]`).click()
      cy.get(`[data-field-name="port"]`).click()
      cy.get(`.execute-button`).click()
      cy.get(`.result-window .CodeMirror-code`).contains(`8000`)
    })
  })
})
