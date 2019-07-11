/* global cy */

describe(`Components`, () => {
  it(`can be added by themes`, () => {
    cy.visit(`/shadowed`).waitForRouteChange()
    cy.getTestElement(`date`).contains(`7/11/2019`)
  })
  it(`added by themes can be shadowed`, () => {
    cy.visit(`/shadowed`).waitForRouteChange()
    cy.getTestElement(`title`).contains(
      `A title since the theme didn't have one`
    )
  })
})
