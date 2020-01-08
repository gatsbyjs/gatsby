import { buildNodeQueriesFromIntrospection } from "./build-queries-from-introspection"
import formatLogMessage from "../../utils/format-log-message"
import checkPluginRequirements from "./check-plugin-requirements"
import store from "../../store"
import { setGatsbyApiToState } from "./set-gatsby-api-to-state"

const onPreBootstrap = async (helpers, pluginOptions) => {
  setGatsbyApiToState(helpers, pluginOptions)

  //
  // exit the build if requirements aren't met
  await checkPluginRequirements()

  //
  // Introspect schema and build gql queries
  const activity = helpers.reporter.activityTimer(
    formatLogMessage`introspect schema`
  )

  if (pluginOptions.verbose) {
    activity.start()
  }

  await buildNodeQueriesFromIntrospection()

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
    // since we may append more image id's to the store down the line
    store.dispatch.imageNodes.setNodeIds(imageNodeIds)
  }
}

export default onPreBootstrap
