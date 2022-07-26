/* global cy */

describe(`Pages`, () => {
  describe(`can be added by themes`, () => {
    it(`installed theme`, () => {
      cy.visit(`/about`).waitForRouteChange()
      cy.getTestElement(`title`).contains(`Blog Title Placeholder`)
    })
    it(`local theme`, () => {
      cy.visit(`/page-from-local`).waitForRouteChange()
      cy.getTestElement(`title`).contains(`Page from local theme`)
    })
  })
  describe(`added by themes can be shadowed`, () => {
    it(`installed theme`, () => {
      cy.visit(`/contact`).waitForRouteChange()
      cy.getTestElement(`title`).contains(
        `A title since the theme didn't have one`
      )
    })

    it(`local theme`, () => {
      cy.visit(`/page-from-local-overwrite`).waitForRouteChange()
      cy.getTestElement(`title`).contains(`Overwritten page from local theme`)
    })

  })
  it(`page queries can be shadowed`, () => {
    cy.visit(`/about`).waitForRouteChange()
    cy.getTestElement(`author`).contains(`Sidhartha Chatterjee`)
  })
  it(`can use different extensions to shadow`, () => {
    cy.visit(`/bio`).waitForRouteChange()
    cy.getTestElement(`bio`).contains(`A bio all about me.`)
  })
})
