/* global cy */

describe(`Site Metadata`, () => {
  describe(`can be added by themes`, () => {
    it(`installed theme`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`title`).contains(`Blog Title Placeholder`)
    })
    it(`local theme`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`description`).contains(`Description placeholder`)
    })
  })
  describe(`added by themes can be overridden`, () => {
    it(`installed theme`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`author`).contains(`Sidhartha Chatterjee`)
    })
    it(`local theme`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`social_twitter`).contains(`chatsidhartha`)
    })
  })
})
