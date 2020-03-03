import { runApisInSteps } from "~/utils/run-steps"
import * as steps from "~/steps/index"

module.exports = runApisInSteps({
  createSchemaCustomization: [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.createSchemaCustomization,
  ],

  sourceNodes: [
    steps.persistPreviouslyCachedImages,
    steps.createContentTypeNodes,
    steps.sourceNodes,
    steps.setImageNodeIdCache,
  ],

  onPostBuild: [steps.setImageNodeIdCache],

  onCreateDevServer: [
    steps.setImageNodeIdCache,
    steps.startPollingForContentUpdates,
  ],
})
