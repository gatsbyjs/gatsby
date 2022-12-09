import { runApiSteps, findApiName } from "./utils/run-steps"
import * as steps from "./steps"

const pluginInitApiName = findApiName(`onPluginInit`)

exports[pluginInitApiName] = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.setErrorMap,
    steps.tempPreventMultipleInstances,
    steps.setRequestHeaders,
  ],
  pluginInitApiName
)

exports.pluginOptionsSchema = steps.pluginOptionsSchema

exports.createSchemaCustomization = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.createSchemaCustomization,
  ],
  `createSchemaCustomization`
)

exports.sourceNodes = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.persistPreviouslyCachedImages,
    steps.sourceNodes,
    steps.setImageNodeIdCache,
  ],
  `sourceNodes`
)

exports.onPreExtractQueries = runApiSteps(
  [steps.onPreExtractQueriesInvokeLeftoverPreviewCallbacks],
  `onPreExtractQueries`
)

exports.onPostBuild = runApiSteps(
  [steps.setImageNodeIdCache, steps.logPostBuildWarnings],
  `onPostBuild`
)

exports.onCreatePage = runApiSteps(
  [
    steps.onCreatepageSavePreviewNodeIdToPageDependency,
    steps.onCreatePageRespondToPreviewStatusQuery,
  ],
  `onCreatePage`
)

exports.onCreateDevServer = runApiSteps(
  [
    steps.imageRoutes,
    steps.setImageNodeIdCache,
    steps.logPostBuildWarnings,
    steps.startPollingForContentUpdates,
  ],
  `onCreateDevServer`
)
