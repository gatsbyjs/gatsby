const TEST_ID = `gatsby-browser-hmr`

describe(`hot reloading above page template (gatsby-browser)`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID).should(
      `contain.text`,
      `%TEST_HMR_IN_GATSBY_BROWSER%`
    )
  })

  it(`hot reloads with new content`, () => {
    const text = `HMR_IN_GATSBY_BROWSER_WORKS`
    cy.exec(
      `npm run update -- --file src/wrap-root-element.js --replacements "TEST_HMR_IN_GATSBY_BROWSER:${text}"`
    )

    cy.waitForHmr()

    cy.getTestElement(TEST_ID).should(`contain.text`, text)
  })
})
