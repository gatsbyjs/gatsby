describe(`immediately unmounted`, () => {
  beforeEach(() => {
    cy.visit(`/immediately-unmounted`, {
      onBeforeLoad(win) {
        cy.spy(win.console, `log`).as(`consoleLog`)
      },
    })
    // Wait strategy lifted from develop runtime e2e test suite
    cy.get(`@consoleLog`).should(`be.called.with`, `[HMR] connected`)
    cy.wait(1000)
  })

  it(`should not error`, () => {
    cy.get(`gatsby-fast-refresh`).should(`not.exist`)
  })
})
