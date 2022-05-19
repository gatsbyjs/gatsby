import { scripts } from "../../../gatsby-script-scripts"

describe(`Duplicate Scripts`, () => {
  beforeEach(() => {
    cy.visit(`/duplicate-scripts`)
    cy.window().then(win => {
      cy.wrap(cy.spy(win.console, `error`)).as(`consoleError`)
      cy.wrap(cy.spy(win.console, `warn`)).as(`consoleWarn`)
    })
  })

  it.only(`Logs warning when same script is loaded with different strategies`, () => {
    cy.get(`@consoleWarn`).should(
      `to.be.calledWithExactly`,
      `Script ${scripts.three} is already loaded with a different strategy. Consider removing duplicates`
    )
  })
})
