import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"

it(`Page with Head Export that uses useLocation works`, () => {
  cy.visit(headFunctionExportSharedData.page.pageWithUseLocation).waitForRouteChange()

  cy.getTestElement(`location-pathname-in-template`)
    .invoke(`text`)
    .then(text  => {
      cy.getTestElement(`location-pathname-in-head`)
      .invoke(`attr`, `content`)
      .should('equal', text)
    })
})
