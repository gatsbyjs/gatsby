import { page, data } from "../../../shared-data/head-function-export.js"

it(`Head function export should not include invalid elements`, () => {
  cy.visit(page.invalidElements).waitForRouteChange()

  cy.get(`head > h1`).should(`not.exist`)
  cy.get(`head > div`).should(`not.exist`)
  cy.get(`head > audio`).should(`not.exist`)
  cy.get(`head > video`).should(`not.exist`)
  cy.get(`head > title`)
    .should(`exist`)
    .and(`have.text`, data.invalidElements.title)
})
