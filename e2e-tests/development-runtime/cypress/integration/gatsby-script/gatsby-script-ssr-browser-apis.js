import { script } from "../../../gatsby-script-scripts"

const page = `/gatsby-script-ssr-browser-apis/`

it(`scripts load successfully when used via wrapPageElement`, () => {
  cy.visit(page).waitForRouteChange()
  cy.getRecord(script.three, `success`, true).should(`equal`, `true`)
  cy.getRecord(script.marked, `success`, true).should(`equal`, `true`)
})

it(`scripts load successfully when used via wrapRootElement`, () => {
  cy.visit(page).waitForRouteChange()
  cy.getRecord(script.jQuery, `success`, true).should(`equal`, `true`)
  cy.getRecord(script.popper, `success`, true).should(`equal`, `true`)
})
