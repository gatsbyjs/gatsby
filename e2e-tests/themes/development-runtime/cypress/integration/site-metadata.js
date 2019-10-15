/* global cy */

describe(`Site Metadata`, () => {
  it(`can be added by themes`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.getTestElement(`title`).contains(`Blog Title Placeholder`)
  })
  it(`added by themes can be overridden`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.getTestElement(`author`).contains(`Sidhartha Chatterjee`)
  })
})
