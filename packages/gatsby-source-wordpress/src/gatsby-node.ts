import { runApiSteps } from "./utils/run-steps"
import * as steps from "./steps"

exports.onPluginInit = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.setErrorMap,
    steps.setRequestHeaders,
    steps.hideAuthPluginOptions,
  ],
  `onPluginInit`
)

exports.onPreBootstrap = runApiSteps(
  [steps.restoreAuthPluginOptions],
  `onPreBootstrap`
)

exports.pluginOptionsSchema = steps.pluginOptionsSchema

exports.createSchemaCustomization = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.createSchemaCustomization,
    steps.addRemoteFileAllowedUrl,
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
