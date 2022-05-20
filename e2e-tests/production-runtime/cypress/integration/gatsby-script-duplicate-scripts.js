import { scripts } from "../../gatsby-script-scripts"

Cypress.config(`defaultCommandTimeout`, 30000) // Since we're asserting network requests

describe(`duplicate scripts`, () => {
  beforeEach(() => {
    cy.visit(`/gatsby-script-duplicate-scripts/`)
    cy.window().then(win => {
      cy.wrap(cy.spy(win.console, `error`)).as(`consoleError`)
      cy.wrap(cy.spy(win.console, `warn`)).as(`consoleWarn`)
    })
  })

  it(`should execute load callbacks of duplicate scripts`, () => {
    cy.get(`[data-on-load-result=duplicate-1]`).should(`have.length`, 1)
    cy.get(`[data-on-load-result=duplicate-2]`).should(`have.length`, 1)
    cy.get(`[data-on-load-result=duplicate-3]`).should(`have.length`, 1)
  })

  it(`should execute error callbacks of duplicate scripts`, () => {
    cy.get(`[data-on-error-result=duplicate-1]`).should(`have.length`, 1)
    cy.get(`[data-on-error-result=duplicate-2]`).should(`have.length`, 1)
    cy.get(`[data-on-error-result=duplicate-3]`).should(`have.length`, 1)
  })

  it.skip(`logs warning when same script is loaded with different strategies`, () => {
    cy.get(`@consoleWarn`).should(
      `to.be.calledWithExactly`,
      `Script ${scripts.three} is already loaded with a different strategy. Consider removing duplicates`
    )
  })
})
