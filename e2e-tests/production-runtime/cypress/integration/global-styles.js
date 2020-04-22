const zIndex = `9001`

describe(`Global style from gatsby-browser.js`, () => {
  beforeEach(() => {
    cy.visit(`/global-style`).waitForRouteChange()
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
})
