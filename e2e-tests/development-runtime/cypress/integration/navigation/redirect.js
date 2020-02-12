let spy
Cypress.on(`window:before:load`, win => {
  spy = cy.spy(win.console, `error`).as(`spyWinConsoleError`) // can be other methods - log, warn, etc
})

describe(`redirect`, () => {
  it(`should redirect page to index page when there is no such page`, () => {
    cy.visit(`/redirect-without-page`).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
    cy.then(() => {
      // assertion below is weird (it's not a function), but is correct - need to disable eslint rule for that
      // eslint-disable-next-line no-unused-expressions
      expect(spy).not.to.be.called
    })
  })

  it(`should redirect page to index page even there is a such page`, () => {
    cy.visit(`/redirect`).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
    cy.then(() => {
      // assertion below is weird (it's not a function), but is correct - need to disable eslint rule for that
      // eslint-disable-next-line no-unused-expressions
      expect(spy).to.be.called
      expect(spy).to.be.calledWith(
        `The route "/redirect" matches both a page and a redirect; this is probably not intentional.`
      )
    })
  })
})
