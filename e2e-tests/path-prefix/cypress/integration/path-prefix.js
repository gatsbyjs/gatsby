const { pathPrefix } = require(`../../gatsby-config`)

const withTrailingSlash = url => `${url}/`

describe(`Production pathPrefix`, () => {
  describe(`navigation`, () => {
    beforeEach(() => {
      cy.visit(`/`).waitForRouteChange()
    })

    it(`returns 200 on base route`, () => {
      cy.location(`pathname`).should(`eq`, withTrailingSlash(pathPrefix))
    })

    it(`renders static image`, () => {
      cy.getTestElement(`static-image`)
        .should(`have.attr`, `srcset`)
        .and(srcset => {
          srcset.split(/\s*,\s*/).forEach(part => {
            expect(part).to.contain(`/blog`)
          })
        })
    })

    it(`renders dynamic image`, () => {
      cy.getTestElement(`gatsby-image`)
        .should(`have.attr`, `srcset`)
        .and(srcset => {
          srcset.split(/\s*,\s*/).forEach(part => {
            expect(part).to.contain(`/blog`)
          })
        })
    })

    it(`prefixes link with /blog`, () => {
      cy.getTestElement(`page-2-link`)
        .should(`have.attr`, `href`)
        .and(`include`, `/blog`)

      cy.getTestElement(`page-ssr-link`)
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
        .go(`back`)
        .waitForRouteChange()

      cy.location(`pathname`).should(`eq`, withTrailingSlash(pathPrefix))
    })

    it(`can navigate to the blogtest page that contains the blog prefix`, () => {
      cy.getTestElement(`page-blogtest-link`).click()

      cy.location(`pathname`).should(
        `eq`,
        withTrailingSlash(`${pathPrefix}/blogtest`)
      )
    })

    it(`can navigate to ssr page`, () => {
      cy.getTestElement(`page-ssr-link`).click()

      cy.location(`pathname`).should(
        `eq`,
        withTrailingSlash(`${pathPrefix}/ssr`)
      )

      cy.getTestElement(`server-data`).contains(`foo`)
    })
  })

  it(`can visit ssr page`, () => {
    cy.visit(`/ssr/`).waitForRouteChange()

    cy.location(`pathname`).should(`eq`, withTrailingSlash(`${pathPrefix}/ssr`))

    cy.getTestElement(`server-data`).contains(`foo`)
  })
})

describe(`pathPrefix with assets handled by file-loader`, () => {
  beforeEach(() => {
    cy.visit(`/file-loader/`).waitForRouteChange()
  })

  it(`prefixes an asset`, () => {
    cy.getTestElement(`file-loader-image`)
      .invoke(`attr`, `src`)
      .should(`include`, withTrailingSlash(pathPrefix))
  })
})
