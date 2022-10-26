import { page, data } from "../../../shared-data/head-function-export.js"

it(`Head function export with FS Route API should work`, () => {
  cy.visit(page.fsRouteApi).waitForRouteChange()
  cy.getTestElement(`title`).should(`have.text`, data.fsRouteApi.slug)
})
