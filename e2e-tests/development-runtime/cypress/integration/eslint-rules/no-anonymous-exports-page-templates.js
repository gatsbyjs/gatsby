describe(`no-anonymous-exports-page-templates`, () => {
  it(`should log warning to console for arrow functions`, () => {
    cy.visit(
      `/eslint-rules/no-anonymous-exports-page-templates`
    ).waitForRouteChange()

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithMatch`,
      /Anonymous arrow functions cause Fast Refresh to not preserve local component state./i
    )
  })
  it(`should log warning to console for function declarations`, () => {
    cy.visit(
      `/eslint-rules/no-anonymous-exports-page-templates-function`
    ).waitForRouteChange()

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithMatch`,
      /Anonymous function declarations cause Fast Refresh to not preserve local component state./i
    )
  })
})
