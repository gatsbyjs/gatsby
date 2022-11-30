import { script } from "../../gatsby-script-scripts"

const page = `/gatsby-script-ssr-browser-apis/`

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

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
