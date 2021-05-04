describe(`no-anonymous-exports-page-templates`, () => {
  it(`should log warning to console for arrow functions`, () => {
    cy.visit(`/eslint-rules/no-anonymous-exports-page-templates`, {
      onBeforeLoad(win) {
        cy.stub(win.console, "log").as(`consoleLog`)
      },
    }).waitForRouteChange()

    cy.get(`@consoleLog`).should(
      `be.calledWithMatch`,
      /Anonymous arrow functions cause Fast Refresh to not preserve local component state./i
    )
  })
  it(`should log warning to console for function declarations`, () => {
    cy.visit(`/eslint-rules/no-anonymous-exports-page-templates-function`, {
      onBeforeLoad(win) {
        cy.stub(win.console, "log").as(`consoleLog`)
      },
    }).waitForRouteChange()

    cy.get(`@consoleLog`).should(
      `be.calledWithMatch`,
      /Anonymous function declarations cause Fast Refresh to not preserve local component state./i
    )
  })
})
