import { runApisInSteps } from "~/utils/run-steps"
import * as steps from "~/steps/index"

module.exports = runApisInSteps({
  sourceNodes: [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.persistPreviouslyCachedImages,
    steps.createContentTypeNodes,
    steps.sourceNodes,
    steps.setImageNodeIdCache,
  ],

  createSchemaCustomization: [steps.createSchemaCustomization],

  onPostBuild: [steps.setImageNodeIdCache],

  onCreateDevServer: [
    steps.setImageNodeIdCache,
    steps.startPollingForContentUpdates,
  ],
})
