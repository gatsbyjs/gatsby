const zIndex = `9001`

describe(`Global style from gatsby-browser.js`, () => {
  beforeEach(() => {
    cy.intercept("/dog-thumbnail.jpg").as("thumbnail")
    cy.intercept("/static/merriweather-latin**.woff2").as("font")
    cy.intercept("localhost:9000/dog-thumbnail-flip.jpg").as(
      "absolute-url-without-protocol"
    )
    cy.intercept("localhost:9000/dog-thumbnail-dither.jpg").as(
      "absolute-url-with-protocol"
    )
    cy.visit(`/global-style/`).waitForRouteChange()
  })

  it(`should apply any styles in root gatsby-browser.js`, () => {
    cy.getTestElement(`global-style`).should(`have.css`, `zIndex`, zIndex)
  })

  it(`should apply any styles in plugin(s) gatsby-browser.js`, () => {
    cy.getTestElement(`global-plugin-style`).should(
      `have.css`,
      `zIndex`,
      zIndex
    )
  })

  describe(`should resolve absolute path in url()`, () => {
    it(`url without host`, () => {
      cy.wait("@thumbnail").should(req => {
        expect(req.response.statusCode).to.be.gte(200).and.lt(400)
      })
      cy.getTestElement(`global-style-background`).should(
        `have.css`,
        `background-image`,
        `url("http://localhost:9000/dog-thumbnail.jpg")`
      )
    })

    it(`url with host and without protocol`, () => {
      cy.wait("@absolute-url-without-protocol").should(req => {
        expect(req.response.statusCode).to.be.gte(200).and.lt(400)
      })
      cy.getTestElement(`global-style-urlwithoutprotocol`).should(
        `have.css`,
        `background-image`,
        `url("http://localhost:9000/dog-thumbnail-flip.jpg")`
      )
    })

    it(`url with host and with protocol`, () => {
      cy.wait("@absolute-url-with-protocol").should(req => {
        expect(req.response.statusCode).to.be.gte(200).and.lt(400)
      })
      cy.getTestElement(`global-style-fullurl`).should(
        `have.css`,
        `background-image`,
        `url("http://localhost:9000/dog-thumbnail-dither.jpg")`
      )
    })
  })

  // Service worker is handling requests so this one is cached by previous runs
  if (!Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    it(`should resolve relative path in url()`, () => {
      cy.wait("@font").should(req => {
        expect(req.response.statusCode).to.be.gte(200).and.lt(400)
      })
    })
  }
})
