import { VALID_NODE_NAMES } from "gatsby/cache-dir/head/constants"
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
      `<h1> is not a valid head element. Please use one of the following: ${VALID_NODE_NAMES.join(
        `, `
      )}.\n\nAlso make sure that wrapRootElement in gatsby-ssr/gatsby-browser doesn't contain UI elements: https://gatsby.dev/invalid-head-elements`
    )
  })
})
