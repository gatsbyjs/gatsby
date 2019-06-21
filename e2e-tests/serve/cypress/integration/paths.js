/* global cy */

describe(`serve`, () => {
  it.skip(`works with a static path`, () => {
    cy.visit(`/static`).waitForRouteChange()
    cy.get(`h1`).contains(`The greatest Static page of all time`)
  })

  it(`works with client side only paths`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get(`h1`).contains(`Index Page`)

    cy.visit(`/12345`).waitForRouteChange()
    cy.get(`h1`).contains(`Not Found in Index`)

    cy.visit(`/app`).waitForRouteChange()
    cy.get(`h1`).contains(`App Page`)

    cy.visit(`/app/12345`).waitForRouteChange()
    cy.get(`h1`).contains(`Not Found in App`)
  })
})
