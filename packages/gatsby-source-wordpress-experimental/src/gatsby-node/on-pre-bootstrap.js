import { buildNodeQueriesFromIntrospection } from "./source-nodes/generate-queries-from-introspection"
import formatLogMessage from "../utils/format-log-message"
import checkPluginRequirements from "../utils/check-plugin-requirements"
import store from "../store"
import { setApiHelpersToState } from "./set-api-helpers-to-state"

const onPreBootstrap = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  setApiHelpersToState(helpers, pluginOptions)

  //
  // exit the build if requirements aren't met
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

  // load up image node id's from cache
  const imageNodeIds = await helpers.cache.get(`image-node-ids`)

  // if they exist,
  if (imageNodeIds && imageNodeIds.length) {
    // touch them all so they don't get garbage collected by Gatsby
    imageNodeIds.forEach(nodeId =>
      helpers.actions.touchNode({
        nodeId,
      })
    )
    // and set them to state to set back to cache later
    store.dispatch.imageNodes.setNodeIds(imageNodeIds)
  }

  // store helpers and plugin options
  // do introspection
  // cache introspection and hash
  // diff introspection hash to see if the schema changed since last run
  // get, store, and cache available content types
  // build, store, and cache gql query strings
}

export default onPreBootstrap
