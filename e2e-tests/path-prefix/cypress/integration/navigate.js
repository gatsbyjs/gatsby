/* global cy */
const { pathPrefix } = require(`../../gatsby-config`)

const withTrailingSlash = url => `${url}/`

describe(`navigate`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`uses pathPrefix`, () => {
    cy.getTestElement(`page-2-button-link`)
      .click()
      .location(`pathname`)
      .should(`eq`, withTrailingSlash(`${pathPrefix}/page-2`))
  })

  it(`can navigate back after using`, () => {
    cy.getTestElement(`page-2-button-link`)
      .click()
      .getTestElement(`index-link`)
      .click()
      .location(`pathname`)
      .should(`eq`, withTrailingSlash(pathPrefix))
  })

  describe(`relative links`, () => {
    it(`can navigate to a subdirectory`, () => {
      cy.getTestElement(`subdir-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `${pathPrefix}/subdirectory/page-1`)
    })

    it(`can navigate to a sibling page`, () => {
      cy.visit(`/subdirectory/page-1`)
        .waitForRouteChange()
        .getTestElement(`page-2-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `${pathPrefix}/subdirectory/page-2`)
    })

    it(`can navigate to a parent page`, () => {
      cy.visit(`/subdirectory/page-1`)
        .waitForRouteChange()
        .getTestElement(`page-parent-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `${pathPrefix}/subdirectory`)
    })

    it(`can navigate to a sibling page programmatically`, () => {
      cy.visit(`/subdirectory/page-1`)
        .waitForRouteChange()
        .getTestElement(`page-2-button-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `${pathPrefix}/subdirectory/page-2`)
    })
  })

  it(`can navigate to 404`, () => {
    cy.getTestElement(`404-link`).click().waitForRouteChange()

    cy.get(`h1`).contains(`NOT FOUND`)
  })

  it(`can load 404 directly`, () => {
    cy.visit(`${pathPrefix}/not-existing-page`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.get(`h1`).contains(`NOT FOUND`)
  })
})
