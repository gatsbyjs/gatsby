import { page } from "../../../shared-data/head-function-export.js"

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe("Scripts", () => {
  beforeEach(() => {
    cy.visit(page.basic).waitForRouteChange()
  })

  // This tests that we don't append elements to the document head more than once
  // A script will get called more than once it that happens
  it(`Inline script work and get called only once`, () => {

    // Head export seem to be appending the tags after waitForRouteChange()
    // We need to find a way to make waitForRouteChange() catch Head export too
    cy.wait(3000)

    cy.window().then(win => {
      expect(win.__SOME_GLOBAL_TO_CHECK_CALL_COUNT__).to.equal(1)
    })
  })
})
