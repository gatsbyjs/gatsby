import { buildNodeQueriesFromIntrospection } from "../source-nodes/generate-queries-from-introspection"
import formatLogMessage from "../../utils/format-log-message"
import checkPluginRequirements from "../../utils/check-plugin-requirements"
import store from "../../store"
import { setApiHelpersToState } from "./set-api-helpers-to-state"
import { introspectionQuery } from "../source-nodes/graphql-queries"
import fetchGraphql from "../../utils/fetch-graphql"
import checkIfSchemaHasChanged from "./check-if-schema-has-changed"

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

  const introspection = await fetchGraphql({
    url: pluginOptions.url,
    query: introspectionQuery,
  })

  const schemaHasChanged = await checkIfSchemaHasChanged({
    introspection,
    helpers,
  })

  // record wether the schema changed so other logic can beware
  store.dispatch.introspection.setSchemaWasChanged(schemaHasChanged)

  const queries = await buildNodeQueriesFromIntrospection(
    {
      introspection,
      schemaHasChanged,
    },
    ...api
  )

  // set the queries in our redux store to use later
  store.dispatch.introspection.setQueries(queries)

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
