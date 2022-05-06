const QUERY_BEFORE = `type GraphQLTypegenQuery = { readonly site: { readonly siteMetadata: { readonly title: string | null } | null } | null };`
const QUERY_AFTER = `type GraphQLTypegenQuery = { readonly site: { readonly siteMetadata: { readonly author: string | null, readonly title: string | null } | null } | null };`
const FRAGMENT_BEFORE = `fragment SiteInformation on Site {
  buildTime
}`
const FRAGMENT_AFTER = `fragment SiteInformation on Site {
  buildTime
  trailingSlash
}`

beforeEach(() => {
  cy.visit(`/graphql-typegen/`).waitForRouteChange()
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`hot-reloading changes on GraphQL Typegen files`, () => {
  it(`contains initial contents in files`, () => {
    cy.readFile('src/gatsby-types.d.ts').then((file) => {
      expect(file).to.include(QUERY_BEFORE)
    })
    cy.readFile('.cache/typegen/fragments.graphql').then((file) => {
      expect(file).to.include(FRAGMENT_BEFORE)
    })
  })

  it(`can edit a page query`, () => {
    cy.exec(
      `npm run update -- --file src/pages/graphql-typegen.tsx --replacements "# %AUTHOR%:author" --exact`
    )

    cy.waitForHmr()

    cy.readFile('src/gatsby-types.d.ts').then((file) => {
      expect(file).to.include(QUERY_AFTER)
    })
  })

  it(`can edit a fragment`, () => {
    cy.exec(
      `npm run update -- --file src/pages/graphql-typegen.tsx --replacements "# %TRAILING_SLASH%:trailingSlash" --exact`
    )

    cy.waitForHmr()

    cy.readFile('.cache/typegen/fragments.graphql').then((file) => {
      expect(file).to.include(FRAGMENT_AFTER)
    })
  })

  it(`successfully runs typecheck`, () => {
    cy.exec(`npm run typecheck`)
  })
})
