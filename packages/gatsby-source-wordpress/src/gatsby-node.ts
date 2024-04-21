import { runApiSteps } from "./utils/run-steps"
import * as steps from "./steps"

export const onPluginInit = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.setErrorMap,
    steps.setRequestHeaders,
    steps.hideAuthPluginOptions,
  ],
  `onPluginInit`,
)

export const onPreBootstrap = runApiSteps(
  [steps.restoreAuthPluginOptions],
  `onPreBootstrap`,
)

export const pluginOptionsSchema = steps.pluginOptionsSchema

export const createSchemaCustomization = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.createSchemaCustomization,
    steps.addRemoteFileAllowedUrl,
  ],
  `createSchemaCustomization`,
)

export const sourceNodes = runApiSteps(
  [
    steps.setGatsbyApiToState,
    steps.persistPreviouslyCachedImages,
    steps.sourceNodes,
    steps.setImageNodeIdCache,
  ],
  `sourceNodes`,
)

export const onPreExtractQueries = runApiSteps(
  [steps.onPreExtractQueriesInvokeLeftoverPreviewCallbacks],
  `onPreExtractQueries`,
)

export const onPostBuild = runApiSteps(
  [steps.setImageNodeIdCache, steps.logPostBuildWarnings],
  `onPostBuild`,
)

export const onCreatePage = runApiSteps(
  [
    steps.onCreatepageSavePreviewNodeIdToPageDependency,
    steps.onCreatePageRespondToPreviewStatusQuery,
  ],
  `onCreatePage`,
)

export const onCreateDevServer = runApiSteps(
  [
    steps.imageRoutes,
    steps.setImageNodeIdCache,
    steps.logPostBuildWarnings,
    steps.startPollingForContentUpdates,
  ],
  `onCreateDevServer`,
)
