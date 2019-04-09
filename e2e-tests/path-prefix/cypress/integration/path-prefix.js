const { pathPrefix } = require(`../../gatsby-config`)

const withTrailingSlash = url => `${url}/`

describe(`Production pathPrefix`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`returns 200 on base route`, () => {
    cy.location(`pathname`).should(`eq`, withTrailingSlash(pathPrefix))
  })

  describe(`navigation`, () => {
    it(`prefixes link with /blog`, () => {
      cy.getTestElement(`page-2-link`)
        .should(`have.attr`, `href`)
        .and(`include`, `/blog`)
    })

    it(`can navigate to secondary page`, () => {
      cy.getTestElement(`page-2-link`).click()

      cy.location(`pathname`).should(
        `eq`,
        withTrailingSlash(`${pathPrefix}/page-2`)
      )
    })

    it(`can navigate back from secondary page`, () => {
      cy.getTestElement(`page-2-link`).click()

      cy.getTestElement(`index-link`).click()

      cy.location(`pathname`).should(`eq`, withTrailingSlash(pathPrefix))
    })

    it(`can go back`, () => {
      cy.getTestElement(`page-2-link`)
        .click()
        .waitForRouteChange()

      cy.go(`back`).waitForRouteChange()

      cy.location(`pathname`).should(`eq`, withTrailingSlash(pathPrefix))
    })
  })
})
