import { buildNodeQueriesFromIntrospection } from "./source-nodes/generate-queries-from-introspection"

import checkPluginRequirements from "../utils/check-plugin-requirements"

const onPreBootstrap = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  //
  // this exits the build if requirements aren't met
  await checkPluginRequirements(...api)

  //
  // Introspect schema and build gql queries
  const activity = helpers.reporter.activityTimer(
    `[gatsby-source-wordpress] introspect schema`
  )
  activity.start()

  await buildNodeQueriesFromIntrospection(...api)

  activity.end()

  // store helpers and plugin options
  // do introspection
  // cache introspection and hash
  // diff introspection hash to see if the schema changed since last run
  // get, store, and cache available content types
  // build, store, and cache gql query strings
}

export default onPreBootstrap
