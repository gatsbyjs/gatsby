import headFunctionExportSharedData from "../../../shared-data/head-function-export.js"
import { contextValue } from "../../../src/app-context.js"

describe(`Head with wrapRootElement`, () => {
  it(`can pickup deeply nested valid head elements`, () => {
    cy.visit(
      headFunctionExportSharedData.page.headWithWrapRooElement
    ).waitForRouteChange()

    const {data} = headFunctionExportSharedData;

    cy.getTestElement(`base`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.base)
    cy.getTestElement(`title`).should(`have.text`, contextValue.posts[0].title)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, contextValue.posts[1].title)
    cy.getTestElement(`noscript`).should(`have.text`, data.static.noscript)
    cy.getTestElement(`style`).should(`contain`, data.static.style)
    cy.getTestElement(`link`)
      .invoke(`attr`, `href`)
      .should(`equal`, data.static.link)
    cy.getTestElement(`jsonLD`).should(`have.text`, data.static.jsonLD)
  })

  it(`can use context values provided in wrapRootElement`, () => {
    cy.visit(
      headFunctionExportSharedData.page.headWithWrapRooElement
    ).waitForRouteChange()

    cy.getTestElement(`title`).should(`have.text`, contextValue.posts[0].title)
    cy.getTestElement(`meta`)
      .invoke(`attr`, `content`)
      .should(`equal`, contextValue.posts[1].title)
  })
})
