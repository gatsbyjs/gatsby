const rgbBlack = `rgb(0, 0, 0, 0.8)` // css jQuery method returns rgb

describe(`Global style from gatsby-browser.js`, () => {
  beforeEach(() => {
    cy.visit(`/global-style`).waitForAPI(`onRouteUpdate`)
  })

  it(`should apply any styles in root gatsby-browser.js`, () => {
    cy.getTestElement(`global-style`).should(`not.have.css`, `color`, rgbBlack)
  })

  it(`should apply any styles in root gatsby-browser.js`, () => {
    cy.getTestElement(`global-plugin-style`).should(
      `not.have.css`,
      `color`,
      rgbBlack
    )
  })
})
