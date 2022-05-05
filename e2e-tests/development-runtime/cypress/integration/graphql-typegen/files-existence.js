// https://docs.cypress.io/api/commands/readfile#Existence
// By default, cy.readFile() asserts that the file exists and will fail if it does not exist.

const FRAGMENT = `fragment TestingFragment on Site {
  siteMetadata {
    author
  }
}`

const GRAPHQL_TYPE = `type CheckMePlease {
  hello: String!
}`

const TS_TYPE = `type CheckMePlease = {
  readonly hello: Scalars['String'];
};`

describe(`typecheck`, () => {
  it(`passes without an error`, () => {
    cy.exec(`npm run typecheck`)
  })
})

describe('fragments.graphql', () => {
  it('exists in .cache folder', () => {
    cy.readFile('.cache/typegen/fragments.graphql')
  })
  it('contains test fragment', () => {
    cy.readFile('.cache/typegen/fragments.graphql').then((file) => {
      expect(file).to.include(FRAGMENT)
    })
  })
})

describe('graphql-config', () => {
  it('exists in .cache folder with correct data', () => {
    cy.readFile('.cache/typegen/graphql.config.json', 'utf-8').then((json) => {
      expect(json).to.deep.equal({
        "schema": ".cache/typegen/schema.graphql",
        "documents": [
          "src/**/**.{ts,js,tsx,jsx}",
          ".cache/typegen/fragments.graphql"
        ],
        "extensions": {
          "endpoints": {
            "default": {
              "url": "http://localhost:8000/___graphql"
            }
          }
        }
      })
    })
  })
})

describe('schema.graphql', () => {
  it('exists in .cache folder', () => {
    cy.readFile('.cache/typegen/schema.graphql')
  })
  it('contains test type', () => {
    cy.readFile('.cache/typegen/schema.graphql').then((file) => {
      expect(file).to.include(GRAPHQL_TYPE)
    })
  })
})

describe('gatsby-types.d.ts', () => {
  it('exists in src folder', () => {
    cy.readFile('src/gatsby-types.d.ts')
  })
  it('contains test type', () => {
    cy.readFile('src/gatsby-types.d.ts').then((file) => {
      expect(file).to.include(TS_TYPE)
    })
  })
})