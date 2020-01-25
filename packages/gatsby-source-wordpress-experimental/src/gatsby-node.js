import { runApisInSteps } from "./utils/run-steps"
import * as steps from "./gatsby-node/index"

module.exports = runApisInSteps({
  onPreBootstrap: [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.persistPreviouslyCachedImages,
  ],

  sourceNodes: [
    // createContentTypeNodes is temporary
    // see https://github.com/wp-graphql/wp-graphql/issues/1045
    steps.createContentTypeNodes,
    steps.sourceNodes,
  ],

  createSchemaCustomization: [steps.createSchemaCustomization],

  onPostBuild: [steps.setImageNodeIdCache],

  onCreateDevServer: [
    steps.setImageNodeIdCache,
    steps.startPollingForContentUpdates,
  ],
})
