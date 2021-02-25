describe(`Redirects`, () => {
  it(`are case insensitive when ignoreCase is set to true`, () => {
    cy.visit(`/Longue-PAGE`, { failOnStatusCode: false }).waitForRouteChange()

    cy.get(`h1`).invoke(`text`).should(`contain`, `Hi from the long page`)
  })
  it(`are case sensitive when ignoreCase is set to false`, () => {
    cy.visit(`/PAGINA-larga`, { failOnStatusCode: false }).waitForRouteChange()

    cy.get(`h1`).invoke(`text`).should(`contain`, `NOT FOUND`)
  })
})
