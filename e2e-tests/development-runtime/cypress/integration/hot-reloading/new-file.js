describe(`hot reloading new page component`, () => {
  before(() => {
    cy.exec(`npm run update -- --file src/pages/sample.js`)
    // TO-DO remove `wait` below and fix this properly in core,
    // we shouldn't have to wait here and core
    // should be smart enough to recover on it's own.
    cy.wait(1000)
  })

  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`can navigate to new page`, () => {
    cy.visit(`/sample`).waitForRouteChange()

    cy.getTestElement(`message`).invoke(`text`).should(`contain`, `Hello`)
  })

  it(`can hot reload a new page file`, () => {
    cy.visit(`/sample`).waitForRouteChange()

    const text = `World`
    cy.exec(
      `npm run update -- --file src/pages/sample.js --replacements "REPLACEMENT:${text}"`
    )

    cy.waitForHmr()

    cy.getTestElement(`message`).invoke(`text`).should(`eq`, `Hello ${text}`)
  })
})
