import { VALID_NODE_NAMES } from "gatsby/cache-dir/head/constants"
import { page } from "../../../shared-data/head-function-export.js"

describe(`head function export should warn`, () => {
  beforeEach(() => {
    cy.visit(page.warnings, {
      onBeforeLoad(win) {
        cy.stub(win.console, `warn`).as(`consoleWarn`)
      },
    })
  })

  it(`for elements that belong in the body`, () => {
    cy.get(`@consoleWarn`).should(
      `be.calledWith`,
      `<h1> is not a valid head element. Please use one of the following: ${VALID_NODE_NAMES.join(
        `, `
      )}`
    )
  })

  it(`for scripts that could use the script component`, () => {
    cy.get(`@consoleWarn`).should(
      `be.calledWith`,
      `It's not a good practice to add scripts here. Please use the <Script> component in your page template instead. see https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-script/`
    )
  })
})
