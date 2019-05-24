const endpoints = [`/___graphql`, `/_graphql`, `/___graphiql`]

const testQueryString = `?query=%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D`

describe(`The GraphQL endpoint`, () => {
  endpoints.forEach(endpoint => {
    it(`Should appear on ${endpoint}`, () => {
      cy.visit(endpoint)
      cy.title().should(`eq`, `GraphiQL`)
    })

    it(`Should execute queries from query string on ${endpoint}`, () => {
      // prefill query from query string
      cy.visit(endpoint + testQueryString)
      cy.get(`.execute-button`).click()
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
      cy.get(`.result-window .CodeMirror-code`).contains(`8001`)
    })
  })
})
