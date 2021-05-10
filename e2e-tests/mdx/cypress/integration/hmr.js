if (Cypress.env("GATSBY_COMMAND") === `develop`) {
  before(() => {
    cy.exec(`npm run reset`)
  })

  after(() => {
    cy.exec(`npm run reset`)
  })

  it(`Can hot-reload`, () => {
    cy.visit(`/hmr`, {
      onBeforeLoad: win => {
        cy.spy(win.console, "log").as(`hmrConsoleLog`)
      },
    }).waitForRouteChange()
    cy.get(`h2`).invoke(`text`).should(`eq`, `Lorem`)

    cy.exec(
      `npm run update -- --file src/pages/hmr.mdx --exact --replacements "Lorem:Ipsum"`
    )

    cy.get(`@hmrConsoleLog`).should(`be.calledWithMatch`, `App is up to date`)
    cy.wait(1000)

    cy.get(`h2`).invoke(`text`).should(`eq`, `Ipsum`)
  })
}
