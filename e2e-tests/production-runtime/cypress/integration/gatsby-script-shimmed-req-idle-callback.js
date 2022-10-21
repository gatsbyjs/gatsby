import { script } from "../../gatsby-script-scripts"
import { resourceRecord } from "../../gatsby-script-records"

Cypress.config(`defaultCommandTimeout`, 30000) // Since we're asserting network requests

const page = `/gatsby-script-scripts-with-sources`

Cypress.on(`window:load`, win => {
  cy.spy(win, `requestIdleCallback`).as(`requestIdleCallback`)
  win.requestIdleCallback = undefined
})

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

/*
 * Some browsers don't support the requestIdleCallback API, so we need to
 * shim it. Here we test that the idle behaviour remains the same with shimmed requestIdleCallback
 */
describe(`using the idle strategy with shimmed requestIdleCallback`, () => {
  it(`should load successfully`, () => {
    cy.visit(page).waitForRouteChange()
    cy.getRecord(script.marked, `success`, true).should(`equal`, `true`)

    cy.get(`@requestIdleCallback`).should(`not.be.called`)
  })

  it(`should load after other strategies`, () => {
    cy.visit(page).waitForRouteChange()

    cy.getRecord(script.marked, resourceRecord.fetchStart).then(
      markedFetchStart => {
        cy.getRecord(script.three, resourceRecord.fetchStart).should(
          `be.lessThan`,
          markedFetchStart
        )
      }
    )
    cy.get(`@requestIdleCallback`).should(`not.be.called`)
  })

  it(`should call an on load callback once the script has loaded`, () => {
    cy.visit(page).waitForRouteChange()
    cy.getRecord(script.marked, resourceRecord.responseEnd).then(() => {
      cy.get(`[data-on-load-result=idle]`)
    })
    cy.get(`@requestIdleCallback`).should(`not.be.called`)
  })

  it(`should call an on error callback if an error occurred`, () => {
    cy.visit(page).waitForRouteChange()
    cy.get(`[data-on-error-result=idle]`)

    cy.get(`@requestIdleCallback`).should(`not.be.called`)
  })
})
