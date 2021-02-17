import { runApisInSteps } from "./utils/run-steps"
import * as steps from "./steps"

import { fetchAndCreateSingleNode } from "~/steps/source-nodes/update-nodes/wp-actions/update"

module.exports = runApisInSteps({
  onPreInit: [steps.setErrorMap, steps.tempPreventMultipleInstances],

  pluginOptionsSchema: steps.pluginOptionsSchema,

  createSchemaCustomization: [
    steps.setGatsbyApiToState,
    steps.ensurePluginRequirementsAreMet,
    steps.ingestRemoteSchema,
    steps.createSchemaCustomization,
  ],

  resolveNodeId: async ({
    objectData: { id, token, user_id: userDatabaseId },
  }) => {
    await fetchAndCreateSingleNode({
      actionType: `PREVIEW`,
      isPreview: true,
      id,
      token,
      singleName: `post`,
      userDatabaseId,
    })

    return id
  },

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
