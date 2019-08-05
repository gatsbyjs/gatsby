/* global cy */

describe(`Components`, () => {
  it(`can be added by themes`, () => {
    cy.visit(`/shadowed`).waitForRouteChange()
    cy.getTestElement(`date`).contains(`6/28/1993`)
  })
  it(`added by themes can be shadowed`, () => {
    cy.visit(`/shadowed`).waitForRouteChange()
    cy.getTestElement(`time`).contains(`2:39:07 PM`)
  })
})
