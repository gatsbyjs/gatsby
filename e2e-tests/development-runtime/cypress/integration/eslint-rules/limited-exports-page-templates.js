describe(`limited-exports-page-templates`, () => {
  it(`should log warning to console for invalid export`, () => {
    cy.visit(
      `/eslint-rules/limited-exports-page-templates`
    ).waitForRouteChange()

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithMatch`,
      /15:1  warning  In page templates only a default export of a valid React component and the named export of a page query is allowed./i
    )
    cy.get(`@hmrConsoleLog`).should(
      `not.be.calledWithMatch`,
      /17:1  warning  In page templates only a default export of a valid React component and the named export of a page query is allowed./i
    )
  })
})
