import store from "../../store"
import formatLogMessage from "../../utils/format-log-message"
import fetchGraphql from "../../utils/fetch-graphql"
import { introspectionQuery } from "../../utils/graphql-queries"

const introspectAndStoreRemoteSchema = async () => {
  const state = store.getState()
  const { pluginOptions, helpers } = state.gatsbyApi
  const { schemaWasChanged } = state.introspection

  if (pluginOptions.verbose && schemaWasChanged) {
    helpers.reporter.info(
      formatLogMessage(`the WPGraphQL schema has changed since the last build`)
    )
    helpers.reporter.info(formatLogMessage(`refetching all data`))
  }

  const INTROSPECTION_CACHE_KEY = `${pluginOptions.url}--introspection-data`
  let introspectionData = await helpers.cache.get(INTROSPECTION_CACHE_KEY)

  if (!introspectionData || schemaWasChanged) {
    introspectionData = await fetchGraphql({
      query: introspectionQuery,
    })

    // cache introspection response
    await helpers.cache.set(INTROSPECTION_CACHE_KEY, introspectionData)
  }

  store.dispatch.introspection.setState({ introspectionData })
}

export default introspectAndStoreRemoteSchema
