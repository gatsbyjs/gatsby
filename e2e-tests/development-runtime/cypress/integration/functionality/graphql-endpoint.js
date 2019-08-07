const endpoints = [`/___graphql`, `/_graphql`, `/___graphiql`]

describe(`The GraphQL endpoint`, () => {
  endpoints.forEach(endpoint => {
    it(`Should appear on ${endpoint}`, () => {
      cy.visit(endpoint)
      cy.title().should(`eq`, `GraphiQL`)
    })
  })
})
