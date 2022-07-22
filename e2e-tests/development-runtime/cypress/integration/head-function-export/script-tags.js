import { page } from "../../../shared-data/head-function-export.js"

describe("scripts tags", () => {
  beforeEach(() => {
    cy.visit(page.basic).waitForRouteChange()
  })

  it(`Inline scripts in Head export works`, () => {
    cy.get(`@hmrConsoleLog`).should(`be.have.callCount`, 2)
   

    cy.get(`@hmrConsoleLog`).should(
      `be.calledWithExactly`,
      `[HMR] connected`,
      `I am an inline script`
    )
  })
})
