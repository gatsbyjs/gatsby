/* eslint-disable no-undef */

const getFullUrl = (route) => `${Cypress.config(`baseUrl`)}/${route}`

describe(`Client Only Paths Tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`)
    cy.get(`.page`).should(`have.text`, `1`)
  })

  it(`all page routes should work`, () => {
    cy.visit(`/page/1`)
    cy.url().should(`eq`, getFullUrl(`page/1`))
    cy.get(`.page`).should(`have.text`, `1`)

    cy.visit(`/page/2`)
    cy.url().should(`eq`, getFullUrl(`page/2`))
    cy.get(`.page`).should(`have.text`, `2`)

    cy.visit(`/page/3`)
    cy.url().should(`eq`, getFullUrl(`page/3`))
    cy.get(`.page`).should(`have.text`, `3`)

    cy.visit(`/page/4`)
    cy.url().should(`eq`, getFullUrl(`page/4`))
    cy.get(`.page`).should(`have.text`, `4`)
  })
})