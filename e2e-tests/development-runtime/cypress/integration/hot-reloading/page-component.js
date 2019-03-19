const TEST_ID = `page-component`

describe(`hot reloading page component`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForAPI(`onRouteUpdate`)
  })
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`contain`, `%GATSBY_SITE%`)
  })

  it(`hot reloads with new content`, () => {
    const text = `Gatsby site`
    cy.exec(
      `npm run update -- --file src/pages/index.js --replacements "GATSBY_SITE:${text}"`
    )

    cy.getTestElement(TEST_ID)
      .invoke(`text`)
      .should(`contain`, text)
  })
})
