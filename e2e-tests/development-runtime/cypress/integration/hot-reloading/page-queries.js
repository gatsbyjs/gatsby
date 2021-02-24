const author = `@gatsbyjs`

beforeEach(() => {
  cy.visit(`/page-query/`).waitForRouteChange()
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`hot-reloading page queries`, () => {
  it(`displays placeholder content on launch`, () => {
    cy.getTestElement(`hot`).invoke(`text`).should(`not.contain`, author)
  })

  it(`can edit a page query`, () => {
    cy.exec(
      `npm run update -- --file src/pages/page-query.js --replacements "# %AUTHOR%:author" --exact`
    )

    cy.waitForHmr()

    cy.getTestElement(`hot`).invoke(`text`).should(`contain`, author)
  })
})
