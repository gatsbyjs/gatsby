const page = {
  js: `/frontmatter-js`,
  javascript: `/frontmatter-javascript`,
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

// Frontmatter that should not be rendered
const otherKey = `Some other key`

describe(`webpack loader`, () => {
  describe(`---yaml frontmatter`, () => {
    beforeEach(() => {
      cy.visit(page.yaml).waitForRouteChange()
    })

    it(`should parse`, () => {
      cy.get(selector).invoke(`text`).should(`eq`, titles.parsed)
    })

    it(`should not leak into the page`, () => {
      cy.contains(otherKey).should(`not.exist`)
    })
  })

  describe(`---json frontmatter`, () => {
    beforeEach(() => {
      cy.visit(page.json).waitForRouteChange()
    })

    it(`should parse`, () => {
      cy.get(selector).invoke(`text`).should(`eq`, `disabled`)
    })

    it(`should not leak into the page`, () => {
      cy.contains(otherKey).should(`not.exist`)
    })
  })

  describe(`---js frontmatter`, () => {
    beforeEach(() => {
      cy.visit(page.js).waitForRouteChange()
    })

    it(`should parse`, () => {
      cy.get(selector).invoke(`text`).should(`eq`, `disabled`)
    })

    it(`should not leak into the page`, () => {
      cy.contains(otherKey).should(`not.exist`)
    })
  })

  describe(`---javascript frontmatter`, () => {
    beforeEach(() => {
      cy.visit(page.javascript).waitForRouteChange()
    })

    it(`should parse`, () => {
      cy.get(selector).invoke(`text`).should(`eq`, `disabled`)
    })

    it(`should not leak into the page`, () => {
      cy.contains(otherKey).should(`not.exist`)
    })
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
