import { runApisInSteps } from "~/utils/run-steps"
import * as steps from "~/steps/index"

module.exports = runApisInSteps({
  onPreBootstrap: [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.persistPreviouslyCachedImages,
  ],

  sourceNodes: [steps.createContentTypeNodes, steps.sourceNodes],

  createSchemaCustomization: [steps.createSchemaCustomization],

  onPostBuild: [steps.setImageNodeIdCache],

  onCreateDevServer: [
    steps.setImageNodeIdCache,
    steps.startPollingForContentUpdates,
  ],
})
