import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"

describe(`Html and body attributes`, () => {
  it(`Page has body and html attributes on direct visit`, () => {
    cy.visit(
      headFunctionExportSharedData.page.htmlAndBodyAttributes
    ).waitForRouteChange()

    cy.get(`body`).should(`have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`have.attr`, `class`, `foo`)
    cy.get(`html`).should(`have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`have.attr`, `lang`, `fr`)
  })

  it(`Page has body and html attributes on client-side navigation`, () => {
    cy.visit(headFunctionExportSharedData.page.basic).waitForRouteChange()

    cy.get(`body`).should(`not.have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`not.have.attr`, `class`, `foo`)
    cy.get(`html`).should(`not.have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`not.have.attr`, `lang`, `fr`)

    cy.visit(
      headFunctionExportSharedData.page.htmlAndBodyAttributes
    ).waitForRouteChange()

    cy.get(`body`).should(`have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`have.attr`, `class`, `foo`)
    cy.get(`html`).should(`have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`have.attr`, `lang`, `fr`)
  })

  it(`Body and html attributes are removed on client-side navigation when new page doesn't set them`, () => {
    cy.visit(
      headFunctionExportSharedData.page.htmlAndBodyAttributes
    ).waitForRouteChange()

    cy.get(`body`).should(`have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`have.attr`, `class`, `foo`)
    cy.get(`html`).should(`have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`have.attr`, `lang`, `fr`)

    cy.visit(headFunctionExportSharedData.page.basic).waitForRouteChange()

    cy.get(`body`).should(`not.have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`not.have.attr`, `class`, `foo`)
    cy.get(`html`).should(`not.have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`not.have.attr`, `lang`, `fr`)
  })
})
