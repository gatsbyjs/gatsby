import store from "../../../store"
import { getGatsbyApi } from "../../../utils/get-gatsby-api"
import generateNodeQueriesFromIngestibleFields from "./generate-queries-from-ingestable-types"

/**
 * buildAndStoreIngestibleRootFieldNodeListQueries
 *
 * Uses plugin options to introspect the remote GraphQL
 * source, run cache logic, and generate GQL query strings/info
 *
 * @returns {Object} GraphQL query info including gql query strings
 */
const buildAndStoreIngestibleRootFieldNodeListQueries = async () => {
  const { pluginOptions, helpers } = getGatsbyApi()

  const QUERY_CACHE_KEY = `${pluginOptions.url}--introspection-node-queries`

  let queries = await helpers.cache.get(QUERY_CACHE_KEY)

  const { schemaHasChanged } = store.getState().introspection

  if (schemaHasChanged || !queries) {
    // regenerate queries from introspection
    queries = await generateNodeQueriesFromIngestibleFields()

    // and cache them
    await helpers.cache.set(QUERY_CACHE_KEY, queries)
  }

  // set the queries in our redux store to use later
  store.dispatch.introspection.setState({
    queries,
  })

  return queries
}

export default buildAndStoreIngestibleRootFieldNodeListQueries
