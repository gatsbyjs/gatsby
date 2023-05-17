import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"

Cypress.on("uncaught:exception", err => {
  if (
    (err.message.includes("Minified React error #418") ||
      err.message.includes("Minified React error #423") ||
      err.message.includes("Minified React error #425")) &&
    Cypress.env(`TEST_PLUGIN_OFFLINE`)
  ) {
    return false
  }
})

describe(`Html and body attributes`, () => {
  it(`Page has body and html attributes on direct visit`, () => {
    cy.visit(
      headFunctionExportSharedData.page.htmlAndBodyAttributes
    ).waitForRouteChange()

    cy.get(`body`).should(`have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`have.attr`, `class`, `foo`)
    cy.get(`body`).should(`have.css`, `margin`, 0)
    cy.get(`body`).should(`have.css`, `padding`, 0)
    cy.get(`html`).should(`have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`have.attr`, `lang`, `fr`)
    cy.get(`html`).should(`have.css`, `margin`, 0)
    cy.get(`html`).should(`have.css`, `padding`, 0)
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
    cy.get(`body`).should(`have.css`, `margin`, 0)
    cy.get(`body`).should(`have.css`, `padding`, 0)
    cy.get(`html`).should(`have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`have.attr`, `lang`, `fr`)
    cy.get(`html`).should(`have.css`, `margin`, 0)
    cy.get(`html`).should(`have.css`, `padding`, 0)
  })

  it(`Body and html attributes are removed on client-side navigation when new page doesn't set them`, () => {
    cy.visit(
      headFunctionExportSharedData.page.htmlAndBodyAttributes
    ).waitForRouteChange()

    cy.get(`body`).should(`have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`have.attr`, `class`, `foo`)
    cy.get(`body`).should(`have.css`, `margin`, 0)
    cy.get(`body`).should(`have.css`, `padding`, 0)
    cy.get(`html`).should(`have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`have.attr`, `lang`, `fr`)
    cy.get(`html`).should(`have.css`, `margin`, 0)
    cy.get(`html`).should(`have.css`, `padding`, 0)

    cy.visit(headFunctionExportSharedData.page.basic).waitForRouteChange()

    cy.get(`body`).should(`not.have.attr`, `data-foo`, `baz`)
    cy.get(`body`).should(`not.have.attr`, `class`, `foo`)
    cy.get(`body`).should(`not.have.css`, `margin`, 0)
    cy.get(`body`).should(`not.have.css`, `padding`, 0)
    cy.get(`html`).should(`not.have.attr`, `data-foo`, `bar`)
    cy.get(`html`).should(`not.have.attr`, `lang`, `fr`)
    cy.get(`html`).should(`not.have.css`, `margin`, 0)
    cy.get(`html`).should(`not.have.css`, `padding`, 0)
  })
})
