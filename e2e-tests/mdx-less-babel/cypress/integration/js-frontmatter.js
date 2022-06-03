describe(`webpack loader`, () => {
  it(`---js frontmatter should not parse by default`, () => {
    cy.visit(`/js-frontmatter`).waitForRouteChange()

    // Check frontmatter not parsed in page context
    cy.get(`[data-cy="js-frontmatter"]`).invoke(`text`).should(`eq`, `disabled`)
  })

  it(`---javascript frontmatter should not parse by default`, () => {
    cy.visit(`/javascript-frontmatter`).waitForRouteChange()

    // Check frontmatter not parsed in page context
    cy.get(`[data-cy="js-frontmatter"]`).invoke(`text`).should(`eq`, `disabled`)
  })
})

describe(`data layer`, () => {
  it(`---js or ---javascript frontmatter should not parse by default`, () => {
    cy.visit(`/mdx-query-js-frontmatter/`).waitForRouteChange()
    cy.contains(`I should not be parsed`).should("not.exist")
  })
})

it(`---js and ---javascript frontmatter should not allow remote code execution`, () => {
  cy.readFile(`cypress/fixtures/file-to-attempt-rce-on.txt`).should(
    `eq`,
    `Nothing here, do not remove`
  )
})
