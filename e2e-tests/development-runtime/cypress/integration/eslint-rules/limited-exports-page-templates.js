describe(`limited-exports-page-templates`, () => {
  // Skipped because HMR not show warnings because of https://github.com/webpack-contrib/webpack-hot-middleware/pull/397
  it.skip(`should log warning to console for invalid export`, () => {
    cy.visit(`/eslint-rules/limited-exports-page-templates`, {
      onBeforeLoad(win) {
        cy.stub(win.console, "log").as(`consoleLog`)
      },
    }).waitForRouteChange()

    cy.get(`@consoleLog`).should(
      `be.calledWithMatch`,
      /15:1  warning  In page templates only a default export of a valid React component and the named export of a page query is allowed./i
    )
    cy.get(`@consoleLog`).should(
      `not.be.calledWithMatch`,
      /17:1  warning  In page templates only a default export of a valid React component and the named export of a page query is allowed./i
    )
  })
})
