describe(`Hot Reloading`, () => {
  beforeEach(() => {
    cy.visit(`/hot-reloading`).waitForRouteChange()
  })

  it(`works for changes in queries in themes`, () => {
    cy.exec(
      `npm run update -- --file ../gatsby-theme-about/src/pages/hot-reloading.js --new-file scripts/new-file.js`
    )

    cy.getTestElement(`author`).contains(`Sidhartha Chatterjee`)
  })
})
