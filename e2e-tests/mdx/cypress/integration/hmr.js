if (Cypress.env("GATSBY_COMMAND") === `develop`) {
  before(() => {
    cy.exec(`npm run reset`)
  })

  after(() => {
    cy.exec(`npm run reset`)
  })

  it(`Can hot-reload`, () => {
    cy.visit(`/hmr`).waitForRouteChange()
    cy.get(`h2`).invoke(`text`).should(`eq`, `Lorem`)

    cy.exec(
      `npm run update -- --file src/pages/hmr.mdx --exact --replacements "Lorem:Ipsum"`
    )

    cy.get(`h2`).invoke(`text`).should(`eq`, `Ipsum`)
  })
}
