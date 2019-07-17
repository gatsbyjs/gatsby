/* global cy */

describe(`Preload`, () => {
  it(`preloads on first visit`, () => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`preloads Gatsby Link tags`, () => {})
})
