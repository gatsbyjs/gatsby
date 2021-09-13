import { runApisInSteps } from "./utils/run-steps"
import * as steps from "./steps"
import { INITIALIZE_PLUGIN_LIFECYCLE_NAME_MAP } from "./constants"

let coreSupportsOnPluginInit: `unstable` | `stable` | undefined

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`)
  if (isGatsbyNodeLifecycleSupported(`onPluginInit`)) {
    coreSupportsOnPluginInit = `stable`
  } else if (isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`)) {
    coreSupportsOnPluginInit = `unstable`
  }
} catch (e) {
  console.error(`Could not check if Gatsby supports onPluginInit lifecycle`)
}

const initializePluginLifeCycleName: string =
  INITIALIZE_PLUGIN_LIFECYCLE_NAME_MAP[coreSupportsOnPluginInit] || `onPreInit`

module.exports = runApisInSteps({
  [initializePluginLifeCycleName]: [
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

  onPostBuild: [steps.setImageNodeIdCache, steps.logPostBuildWarnings],

  onCreatePage: [
    steps.onCreatepageSavePreviewNodeIdToPageDependency,
    steps.onCreatePageRespondToPreviewStatusQuery,
  ],

  onCreateDevServer: [
    steps.setImageNodeIdCache,
    steps.logPostBuildWarnings,
    steps.startPollingForContentUpdates,
  ],
})
