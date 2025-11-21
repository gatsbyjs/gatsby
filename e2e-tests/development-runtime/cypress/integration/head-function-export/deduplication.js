import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"

// XXX FIXME(serhalp): AssertionError: Timed out retrying after 30000ms: Too many elements found. Found '2', expected '1'.
it(`Deduplicates multiple tags with same id`, () => {
  cy.visit(headFunctionExportSharedData.page.deduplication).waitForRouteChange()

  // deduplication link has id and should be deduplicated
  cy.get(`link[rel=deduplication]`).should("have.length", 1)
  // last deduplication link should win
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
