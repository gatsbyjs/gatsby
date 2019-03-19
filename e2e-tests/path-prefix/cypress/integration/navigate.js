/* global cy */
const { pathPrefix } = require(`../../gatsby-config`)

const withTrailingSlash = url => `${url}/`

describe(`navigate`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
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
})
