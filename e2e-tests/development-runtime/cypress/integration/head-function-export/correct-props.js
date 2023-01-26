import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"

it(`Head function export receive correct props`, () => {
  cy.visit(headFunctionExportSharedData.page.correctProps).waitForRouteChange()

  const data = {
    site: {
      siteMetadata: {
        headFunctionExport: {
          ...headFunctionExportSharedData.data.queried,
        },
      },
    },
  }
  const location = {
    pathname: headFunctionExportSharedData.page.correctProps,
  }

  const pageContext = headFunctionExportSharedData.data.pageContext

  cy.getTestElement(`pageContext`)
    .invoke(`attr`, `content`)
    .should(`equal`, JSON.stringify(pageContext, null, 2))

  cy.getTestElement(`location`)
    .invoke(`attr`, `content`)
    .should(`equal`, JSON.stringify(location, null, 2))

  cy.getTestElement(`data`)
    .invoke(`attr`, `content`)
    .should(`equal`, JSON.stringify(data, null, 2))
})
