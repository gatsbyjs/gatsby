describe(`Engines (SSR)`, () => {
  beforeEach(() => {
    cy.visit("/ssr").waitForRouteChange()
  })
  it(`should work`, () => {
    cy.get('[data-cy-id="getserverdata-result"]').should(
      "have.text",
      "getServerData used in contentful E2E test"
    )
  })
})
