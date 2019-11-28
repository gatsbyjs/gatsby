import { buildNodeQueriesFromIntrospection } from "./source-nodes/generate-queries-from-introspection"
import formatLogMessage from "../utils/format-log-message"
import checkPluginRequirements from "../utils/check-plugin-requirements"
import store from "../store"

const onPreBootstrap = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]
  store.dispatch.gatsbyApi.setState({ helpers, pluginOptions })

  //
  // this exits the build if requirements aren't met
  await checkPluginRequirements(...api)

  //
  // Introspect schema and build gql queries
  const activity = helpers.reporter.activityTimer(
    formatLogMessage`introspect schema`
  )

  if (pluginOptions.verbose) {
    activity.start()
  }

  await buildNodeQueriesFromIntrospection(...api)

  if (pluginOptions.verbose) {
    activity.end()
  }

  // store helpers and plugin options
  // do introspection
  // cache introspection and hash
  // diff introspection hash to see if the schema changed since last run
  // get, store, and cache available content types
  // build, store, and cache gql query strings
}

export default onPreBootstrap
