import { page } from "../../../shared-data/head-function-export.js"

describe(`head function export with invalid elements`, () => {
  it(`should only include valid elements`, () => {
    cy.visit(page.invalidElements)

    cy.get(`head > h1`).should(`not.exist`)
    cy.get(`head > div`).should(`not.exist`)
    cy.get(`head > audio`).should(`not.exist`)
    cy.get(`head > video`).should(`not.exist`)
    cy.get(`head > title`)
      .should(`exist`)
      .and(`have.text`, `I should actually be inserted, unlike the others`)
  })
})
