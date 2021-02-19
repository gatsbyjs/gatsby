const zIndex = `9001`

describe(`Global style from gatsby-browser.js`, () => {
  beforeEach(() => {
    cy.intercept("/dog-thumbnail.jpg").as("thumbnail")
    cy.intercept("/static/merriweather-latin**.woff2").as("font")
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

  it(`should resolve absolute path in url()`, () => {
    cy.wait("@thumbnail").should(req => {
      expect(req.response.statusCode).to.be.gte(200)
    })
    cy.getTestElement(`global-style-background`).should(
      `have.css`,
      `background-image`,
      `url("http://localhost:9000/dog-thumbnail.jpg")`
    )
  })

  it(`should resolve relative path in url()`, () => {
    cy.wait("@font").should(req => {
      expect(req.response.statusCode).to.be.gte(200)
    })
  })
})
