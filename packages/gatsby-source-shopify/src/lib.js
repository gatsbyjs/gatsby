import prettyjson from "prettyjson"
import chalk from "chalk"
import { get, getOr, last } from "lodash/fp"

/**
 * Print an error from a GraphQL client
 */
export const printGraphQLError = e => {
  const prettyjsonOptions = { keysColor: `red`, dashColor: `red` }

  if (e.response && e.response.errors) {
    if (e.message.startsWith(`access denied`)) {
      console.error(chalk`\n{yellow Check your token has this read authorization,
      or omit fetching this object using the "includeCollections" options in gatsby-source-shopify plugin options}`)
    }
    console.error(prettyjson.render(e.response.errors, prettyjsonOptions))
  }

  if (e.request) console.error(prettyjson.render(e.request, prettyjsonOptions))
}

/**
 * Request a query from a client.
 */
export const queryOnce = async (client, query, first = 250, after) =>
  await client.request(query, { first, after })

/**
 * Get all paginated data from a query. Will execute multiple requests as
 * needed.
 */
export const queryAll = async (
  client,
  path,
  query,
  first = 250,
  after = null,
  aggregatedResponse = null
) => {
  const data = await queryOnce(client, query, first, after)
  const edges = getOr([], [...path, `edges`], data)
  const nodes = edges.map(edge => edge.node)

  aggregatedResponse = aggregatedResponse
    ? aggregatedResponse.concat(nodes)
    : nodes

  if (get([...path, `pageInfo`, `hasNextPage`], data)) {
    return queryAll(
      client,
      path,
      query,
      first,
      last(edges).cursor,
      aggregatedResponse
    )
  }

  return aggregatedResponse
}
