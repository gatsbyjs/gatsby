import type { DocumentNode } from "graphql"

export function transformUsingGraphQLCodemods(ast: DocumentNode): {
  ast: DocumentNode
  hasChanged: boolean
} {
  if (process.env.GATSBY_GRAPHQL_NESTED_SORT_AND_AGGREGATE) {
    try {
      const {
        processGraphQLQuery,
      } = require(`gatsby-codemods/transforms/sort-and-aggr-graphql`)
      return processGraphQLQuery(ast)
    } catch (e) {
      return { ast, hasChanged: false }
    }
  }
  return { ast, hasChanged: false }
}
