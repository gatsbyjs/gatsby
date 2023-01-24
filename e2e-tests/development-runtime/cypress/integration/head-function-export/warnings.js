import { createWarningForInvalidTag } from "gatsby/cache-dir/head/utils"
import { page } from "../../../shared-data/head-function-export.js"

describe(`Head function export should warn`, () => {
  beforeEach(() => {
    cy.visit(page.warnings, {
      onBeforeLoad(win) {
        cy.stub(win.console, `warn`).as(`consoleWarn`)
      },
    }).waitForRouteChange()
  })

  it(`for elements that belong in the body`, () => {
    cy.get(`@consoleWarn`).should(
      `be.calledWith`,
      createWarningForInvalidTag(`h1`)
    )
  })
})
