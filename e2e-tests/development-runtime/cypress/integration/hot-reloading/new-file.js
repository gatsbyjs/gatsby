describe(`hot reloading new page component`, () => {
  before(() => {
    cy.exec(`npm run update -- --file src/pages/sample.js`)
  })

  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })

  it(`can navigate to new page`, () => {
    cy.visit(`/sample`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`message`)
      .invoke(`text`)
      .should(`contain`, `Hello`)
  })

  it(`can hot reload a new page file`, () => {
    const text = `World`
    cy.exec(
      `npm run update -- --file src/pages/sample.js --replacements "REPLACEMENT:${text}"`
    )

    cy.visit(`/sample`).waitForAPI(`onRouteUpdate`)

    cy.getTestElement(`message`)
      .invoke(`text`)
      .should(`eq`, `Hello ${text}`)
  })
})
