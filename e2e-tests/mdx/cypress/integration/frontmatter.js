const page = {
  js: `/frontmatter-js`,
  javscript: `/frontmatter-javascript`,
  yaml: `/frontmatter-yaml`,
  json: `/frontmatter-json`,
  graphqlQuery: `/frontmatter-graphql-query`,
}

// Attribute selector for element we assert against in pages
const selector = `[data-cy="frontmatter"]`

// Strings used for frontmatter titles
const titles = {
  notParsed: `I should not be parsed`,
  parsed: `I am parsed`,
}

describe(`webpack loader`, () => {
  it(`---yaml frontmatter should parse`, () => {
    cy.visit(page.yaml).waitForRouteChange()
    cy.get(selector).invoke(`text`).should(`eq`, titles.parsed)
  })

  it(`---json frontmatter should parse`, () => {
    cy.visit(page.json).waitForRouteChange()
    cy.get(selector).invoke(`text`).should(`eq`, titles.parsed)
  })

  it(`---js frontmatter should not parse by default`, () => {
    cy.visit(page.js).waitForRouteChange()
    cy.get(selector).invoke(`text`).should(`eq`, `disabled`)
  })

  it(`---javascript frontmatter should not parse by default`, () => {
    cy.visit(page.javscript).waitForRouteChange()
    cy.get(selector).invoke(`text`).should(`eq`, `disabled`)
  })
})

describe(`data layer`, () => {
  it(`---js or ---javascript frontmatter should not parse by default`, () => {
    cy.visit(page.graphqlQuery).waitForRouteChange()
    cy.contains(titles.notParsed).should(`not.exist`)
  })
})

it(`---js and ---javascript frontmatter should not allow remote code execution`, () => {
  cy.readFile(`cypress/fixtures/file-to-attempt-rce-on.txt`).should(
    `eq`,
    `Nothing here, do not remove`
  )
})
