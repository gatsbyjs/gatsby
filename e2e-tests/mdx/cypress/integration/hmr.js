if (Cypress.env("GATSBY_COMMAND") === `develop`) {
  before(() => {
    cy.exec(`npm run reset`)
  })

  after(() => {
    cy.exec(`npm run reset`)
  })

  it(`Can hot-reload markdown content`, () => {
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

  it(`Can hot-reload react content (i.e. change prop in mdx content)`, () => {
    cy.visit(`/hmr`, {
      onBeforeLoad: win => {
        cy.spy(win.console, "log").as(`hmrConsoleLog`)
      },
    }).waitForRouteChange()
    cy.get(`[data-testid="test-prop-edit"]`)
      .invoke(`text`)
      .should(`eq`, `prop-before`)

    cy.exec(
      `npm run update -- --file src/pages/hmr.mdx --exact --replacements "prop-before:prop-after"`
    )

    cy.get(`@hmrConsoleLog`).should(`be.calledWithMatch`, `App is up to date`)
    cy.wait(1000)

    cy.get(`[data-testid="test-prop-edit"]`)
      .invoke(`text`)
      .should(`eq`, `prop-after`)
  })

  it(`Can hot-reload imported js components`, () => {
    cy.visit(`/hmr`, {
      onBeforeLoad: win => {
        cy.spy(win.console, "log").as(`hmrConsoleLog`)
      },
    }).waitForRouteChange()
    cy.get(`[data-testid="test-imported-edit"]`)
      .invoke(`text`)
      .should(`eq`, `component-before`)

    cy.exec(
      `npm run update -- --file src/components/hmr-component-edit.js --exact --replacements "component-before:component-after"`
    )

    cy.get(`@hmrConsoleLog`).should(`be.calledWithMatch`, `App is up to date`)
    cy.wait(1000)

    cy.get(`[data-testid="test-imported-edit"]`)
      .invoke(`text`)
      .should(`eq`, `component-after`)
  })
}
