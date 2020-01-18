import store from "../../store"
import formatLogMessage from "../../utils/format-log-message"
import fetchGraphql from "../../utils/fetch-graphql"
import { introspectionQuery } from "../graphql-queries"

const introspectAndStoreRemoteSchema = async () => {
  const state = store.getState()
  const { pluginOptions, helpers } = state.gatsbyApi
  const { schemaHasChanged } = state.introspection

  const INTROSPECTION_CACHE_KEY = `${pluginOptions.url}--introspection-data`

  let introspectionData = await helpers.cache.get(INTROSPECTION_CACHE_KEY)

  if (!introspectionData || schemaHasChanged) {
    if (pluginOptions.verbose && schemaHasChanged) {
      helpers.reporter.info(
        formatLogMessage(
          `The WPGraphQL schema has changed since the last build. \n Refetching all data.`
        )
      )
    }

    introspectionData = await fetchGraphql({
      url: pluginOptions.url,
      query: introspectionQuery,
    })

    // cache introspection response
    await helpers.cache.set(INTROSPECTION_CACHE_KEY, introspectionData)
  }

  store.dispatch.introspection.setState({ introspectionData })
}

export default introspectAndStoreRemoteSchema
