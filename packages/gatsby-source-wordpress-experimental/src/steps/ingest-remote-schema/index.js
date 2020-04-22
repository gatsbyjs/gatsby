import { runSteps } from "~/utils/run-steps"
import { formatLogMessage } from "~/utils/format-log-message"

import { checkIfSchemaHasChanged } from "./diff-schemas"
import { introspectAndStoreRemoteSchema } from "./introspect-remote-schema"
import { identifyAndStoreIngestableFieldsAndTypes } from "./identify-and-store-ingestable-types"
import { buildNonNodeQueries } from "./build-and-store-ingestible-root-field-non-node-queries"
import { buildNodeQueries } from "./build-queries-from-introspection/build-node-queries"
import { cacheFetchedTypes } from "./cache-fetched-types"

const ingestRemoteSchema = async (helpers, pluginOptions) => {
  // @todo if this is an inc build or preview, we need quicker logic
  // around determining if the remote schema has changed.
  // for now, we need to do a full check each time
  // Eventually this should happen per-Type
  // if (helpers.traceId === `refresh-createSchemaCustomization`) {
  //   return
  // }

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`ingest WPGraphQL schema`)
  )

  activity.start()

  await runSteps(
    [
      checkIfSchemaHasChanged,
      introspectAndStoreRemoteSchema,
      identifyAndStoreIngestableFieldsAndTypes,
      buildNodeQueries,
      buildNonNodeQueries,
      cacheFetchedTypes,
    ],
    helpers,
    pluginOptions
  )

  activity.end()
}

export { ingestRemoteSchema }
