describe(`Hot Reloading`, () => {
  beforeEach(() => {
    cy.visit(`/contact`).waitForRouteChange()
  })

  it(`works for changes in queries in themes`, () => {
    cy.exec(
      `npm run update -- --file ../gatsby-theme-about/src/pages/contact.js --new-file scripts/new-file.js`
    )

    // cy.getTestElement(`author`).contains(`Sidhartha Chatterjee`)
  })
})
