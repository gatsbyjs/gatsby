describe(`local plugin gatsby-*.ts files`, () => {
  it(`gatsby-node.ts runs as expected`, () => {
    cy.visit(`/local-plugin-ts`).waitForRouteChange()

    cy.getTestElement(`local-plugin-ts`).contains(
      `I am injected by a local plugin with a gatsby-node.ts file`
    )
  })
})
