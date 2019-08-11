/* global cy */

describe(`Pages`, () => {
  it(`can be added by themes`, () => {
    cy.visit(`/about`).waitForRouteChange()
    cy.getTestElement(`title`).contains(`Blog Title Placeholder`)
  })
  it(`added by themes can be shadowed`, () => {
    cy.visit(`/contact`).waitForRouteChange()
    cy.getTestElement(`title`).contains(
      `A title since the theme didn't have one`
    )
  })
})
