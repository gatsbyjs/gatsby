const TEST_ID = `page-component`

describe(`hot reloading page component`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID).should(`contain.text`, `%GATSBY_SITE%`)
  })

  it(`hot reloads with new content`, () => {
    const text = `Gatsby site`
    cy.exec(
      `npm run update -- --file src/pages/index.js --replacements "GATSBY_SITE:${text}"`
    )

    cy.waitForHmr()

    cy.getTestElement(TEST_ID).should(`contain.text`, text)
  })
})
