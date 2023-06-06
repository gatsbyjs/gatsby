import { getStore } from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import generateNodeQueriesFromIngestibleFields from "./generate-queries-from-ingestable-types"
import { getPersistentCache, setPersistentCache } from "~/utils/cache"

/**
 * buildNodeQueries
 *
 * Uses plugin options to introspect the remote GraphQL
 * source, run cache logic, and generate GQL query strings/info
 *
 * @returns {Object} GraphQL query info including gql query strings
 */
const buildNodeQueries = async () => {
  const { pluginOptions } = getGatsbyApi()

  const QUERY_CACHE_KEY = `${pluginOptions.url}--introspection-node-queries`

  let nodeQueries = await getPersistentCache({ key: QUERY_CACHE_KEY })

  const { schemaWasChanged } = getStore().getState().remoteSchema

  if (schemaWasChanged || !nodeQueries) {
    // regenerate queries from introspection
    nodeQueries = await generateNodeQueriesFromIngestibleFields()

    // and cache them
    await setPersistentCache({ key: QUERY_CACHE_KEY, value: nodeQueries })
  }
  // set the queries in our redux store to use later
  getStore().dispatch.remoteSchema.setState({
    nodeQueries,
  })

  return nodeQueries
}

export { buildNodeQueries }
