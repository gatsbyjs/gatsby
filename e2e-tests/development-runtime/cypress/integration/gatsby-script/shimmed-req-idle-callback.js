import { Script, scripts } from "../../../gatsby-script-scripts"
import { ResourceRecord } from "../../records"

// The page that we will assert against
const page = `/gatsby-script-scripts-with-sources`

Cypress.on(`window:before:load`, win => {
  cy.spy(win, "requestIdleCallback").as("requestIdleCallback")
  win.requestIdleCallback = undefined
})

/*
 * Some browsers don't support the requestIdleCallback API, so we need to
 * shim it. Here we test that the idle behaviour remains the same with shimmed requestIdleCallback
 */
describe(`using the idle strategy with shimmed requestIdleCallback`, () => {
  it(`should load successfully`, () => {
    cy.visit(page).waitForRouteChange()
    cy.getRecord(Script.marked, `success`, true).should(`equal`, `true`)

    cy.get("@requestIdleCallback").should("not.be.called")
  })

  it(`should load after other strategies`, () => {
    cy.visit(page).waitForRouteChange()

    cy.getRecord(Script.marked, ResourceRecord.fetchStart).then(
      markedFetchStart => {
        cy.getRecord(Script.three, ResourceRecord.fetchStart).should(
          `be.lessThan`,
          markedFetchStart
        )
      }
    )
    cy.get("@requestIdleCallback").should("not.be.called")
  })

  it(`should call an on load callback once the script has loaded`, () => {
    cy.visit(page).waitForRouteChange()
    cy.getRecord(Script.marked, ResourceRecord.responseEnd).then(() => {
      cy.get(`[data-on-load-result=idle]`)
    })
    cy.get("@requestIdleCallback").should("not.be.called")
  })

  it(`should call an on error callback if an error occurred`, () => {
    cy.visit(page).waitForRouteChange()
    cy.get(`[data-on-error-result=idle]`)

    cy.get("@requestIdleCallback").should("not.be.called")
  })
})
