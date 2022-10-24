Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(`query-string`, () => {
  describe(`Supports percent encoded query string values`, () => {
    beforeEach(() => {
      cy.visit(`/query-params`)
      cy.window().then(win => {
        cy.wrap(cy.spy(win.console, `error`)).as(`consoleError`)
      })
    })

    it(`renders page when percent encoded query string value is used on client navigation`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.window()
        .then(win => win.___navigate(`/query-params?message=%25`))
        .waitForRouteChange()

      cy.getTestElement(`location.search`)
        .invoke(`text`)
        .should(`equal`, `?message=%25`)
    })

    it(`renders page when percent encoded query string value is used on direct visit `, () => {
      cy.visit(`/query-params?message=%25`).waitForRouteChange()
      cy.getTestElement(`location.search`)
        .invoke(`text`)
        .should(`equal`, `?message=%25`)
    })

    it(`should not throw error when percent encoded query string value is used`, () => {
      cy.get(`@consoleError`).should(`not.be.called`)
    })
  })
})
