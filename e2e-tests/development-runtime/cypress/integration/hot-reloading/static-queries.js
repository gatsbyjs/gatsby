const author = `@gatsbyjs`

beforeEach(() => {
  cy.visit(`/static-query/`).waitForRouteChange()
})

describe(`hot-reloading static queries`, () => {
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(`hot`).invoke(`text`).should(`not.contain`, author)
  })

  it(`can update a StaticQuery element`, () => {
    cy.exec(
      `npm run update -- --file src/components/static-query/hot.js --replacements "# %AUTHOR%:author" --exact`
    )

    cy.getTestElement(`hot`).invoke(`text`).should(`contain`, author)
  })

  describe(`useStaticQuery`, () => {
    it(`displays placeholder content on launch`, () => {
      cy.getTestElement(`use-static-query-hot`)
        .invoke(`text`)
        .should(`not.contain`, author)
    })

    it(`can update a useStaticQuery element`, () => {
      cy.exec(
        `npm run update -- --file src/components/static-query/use-static-query/hot.js --replacements "# %AUTHOR%:author" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(`use-static-query-hot`)
        .invoke(`text`)
        .should(`contain`, author)
    })
  })
})
