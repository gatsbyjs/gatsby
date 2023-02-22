const { assetPrefix } = require(`../../gatsby-config`)

const assetPrefixExpression = new RegExp(`^${assetPrefix}`)

const assetPrefixMatcher = (chain, attr = `href`) =>
  chain.should(`have.attr`, attr).and(`matches`, assetPrefixExpression)

beforeEach(() => {
  cy.intercept(/page-data/).as("page-data")
  cy.intercept(/slice-data/).as("slice-data")
})

describe(`assetPrefix`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`page-data is prefixed with asset prefix`, () => {
    cy.wait("@page-data")

    cy.get("@page-data").then((...intercepts) => {
      expect(intercepts).to.have.length(1)

      for (const intercept of intercepts) {
        expect(intercept.request.url).to.match(assetPrefixExpression)
      }
    })
  })

  it(`slice-data is prefixed with asset prefix`, () => {
    cy.wait("@slice-data")

    cy.get("@slice-data").then((...intercepts) => {
      expect(intercepts).to.have.length(1)

      for (const intercept of intercepts) {
        expect(intercept.request.url).to.match(assetPrefixExpression)
      }
    })
  })

  describe(`runtime`, () => {
    it(`prefixes styles`, () => {
      assetPrefixMatcher(cy.get(`head style[data-href]`), `data-href`)
    })

    it(`prefixes scripts`, () => {
      assetPrefixMatcher(cy.get(`body script[src]`), `src`)
    })
  })

  describe(`gatsby-plugin-manifest`, () => {
    it(`doesn’t prefix manifest`, () => {
      cy.get(`head link[rel="manifest"]`)
        .should(`have.attr`, `href`)
        .and(`not.matches`, assetPrefixExpression)
    })

    it(`prefixes icon`, () => {
      assetPrefixMatcher(cy.get(`head link[rel="icon"]`))
    })

    it(`prefixes manifest icons`, () => {
      assetPrefixMatcher(cy.get(`head link[rel="apple-touch-icon"]`))
    })
  })

  describe(`gatsby-plugin-sitemap`, () => {
    it(`prefixes sitemap`, () => {
      assetPrefixMatcher(cy.get(`head link[rel="sitemap"]`))
    })
  })

  describe(`gatsby-plugin-feed`, () => {
    it(`prefixes RSS feed`, () => {
      assetPrefixMatcher(cy.get(`head link[type="application/rss+xml"]`))
    })
  })
})

describe(`assetPrefix with assets handled by file-loader`, () => {
  beforeEach(() => {
    cy.visit(`/file-loader/`).waitForRouteChange()
  })

  it(`prefixes an asset`, () => {
    assetPrefixMatcher(cy.getTestElement(`file-loader-image`), `src`)
  })
})
