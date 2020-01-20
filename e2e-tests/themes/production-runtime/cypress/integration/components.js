/* global cy */

describe(`Components`, () => {
  describe(`can be added by themes`, () => {
    it(`installed theme`, () => {
      cy.visit(`/shadowed`).waitForRouteChange()
      cy.getTestElement(`date`).contains(`6/28/1993`)
    })
    it(`local theme`, () => {
      cy.visit(`/shadowed-local`).waitForRouteChange()
      cy.getTestElement(`header`).contains(
        `This is component to test shadowing of local theme`
      )
    })
  })
  describe(`added by themes can be shadowed`, () => {
    it(`installed theme`, () => {
      cy.visit(`/shadowed`).waitForRouteChange()
      cy.getTestElement(`time`).contains(`2:39:07 PM`)
    })
    it(`local theme`, () => {
      cy.visit(`/shadowed-local`).waitForRouteChange()
      cy.getTestElement(`pre`).contains(`This is in main site`)
      cy.getTestElement(`pre`).should(
        `not.contain`,
        `This is in gatsby-theme-local`
      )
    })
  })
})
