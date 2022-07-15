import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"

it(`Head function export receive correct props`, () => {
  cy.visit(headFunctionExportSharedData.page.deduplication).waitForRouteChange()

  // icon has id and should be deduplicated
  cy.get(`link[rel=deduplication]`).should("have.length", 1)
  // last icon should win
  cy.get(`link[rel=deduplication]`).should("have.attr", "href", "/bar")
  // we should preserve id
  cy.get(`link[rel=deduplication]`).should(
    "have.attr",
    "id",
    "deduplication-test"
  )

  // alternate links are not using id, so should have multiple instances
  cy.get(`link[rel=alternate]`).should("have.length", 2)
})
