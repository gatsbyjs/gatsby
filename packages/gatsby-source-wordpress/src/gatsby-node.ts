import { runApisInSteps } from "./utils/run-steps"
import * as steps from "./steps"

module.exports = runApisInSteps({
  onPreInit: [
    steps.setGatsbyApiToState,
    steps.setErrorMap,
    steps.tempPreventMultipleInstances,
  ],

  pluginOptionsSchema: steps.pluginOptionsSchema,

  createSchemaCustomization: [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.createSchemaCustomization,
  ],

  sourceNodes: [
    steps.setGatsbyApiToState,
    steps.persistPreviouslyCachedImages,
    steps.sourceNodes,
    steps.setImageNodeIdCache,
  ],

  onPreExtractQueries: [
    steps.onPreExtractQueriesInvokeLeftoverPreviewCallbacks,
  ],

  onPostBuild: [steps.setImageNodeIdCache],

  onCreatePage: [
    steps.onCreatepageSavePreviewNodeIdToPageDependency,
    steps.onCreatePageRespondToPreviewStatusQuery,
  ],

  onCreateDevServer: [
    steps.setImageNodeIdCache,
    steps.startPollingForContentUpdates,
  ],
})
