import { runSteps } from "~/utils/run-steps"
import { formatLogMessage } from "~/utils/format-log-message"

import { checkIfSchemaHasChanged } from "./diff-schemas"
import { introspectAndStoreRemoteSchema } from "./introspect-remote-schema"
import { identifyAndStoreIngestableFieldsAndTypes } from "./identify-and-store-ingestable-types"
import { buildNonNodeQueries } from "./build-and-store-ingestible-root-field-non-node-queries"
import { buildNodeQueries } from "./build-queries-from-introspection/build-node-queries"
import { cacheFetchedTypes } from "./cache-fetched-types"
import { writeQueriesToDisk } from "./write-queries-to-disk"

const ingestRemoteSchema = async (helpers, pluginOptions) => {
  const schemaTimeKey = `lastIngestRemoteSchemaTime`
  const lastIngestRemoteSchemaTime = await helpers.cache.get(schemaTimeKey)

  const ingestedSchemaInLastTenSeconds =
    Date.now() - lastIngestRemoteSchemaTime <= 10000

  if (lastIngestRemoteSchemaTime && ingestedSchemaInLastTenSeconds) {
    // only allow this to run once every ten seconds
    // this prevents thrashing when many webhooks are received at once
    return
  }

  await helpers.cache.set(schemaTimeKey, Date.now())

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`ingest WPGraphQL schema`)
  )

  activity.start()

  try {
    await runSteps(
      [
        checkIfSchemaHasChanged,
        introspectAndStoreRemoteSchema,
        identifyAndStoreIngestableFieldsAndTypes,
        [buildNodeQueries, buildNonNodeQueries],
        [cacheFetchedTypes, writeQueriesToDisk],
      ],
      helpers,
      pluginOptions
    )
  } catch (e) {
    helpers.reporter.panic(e)
  }

  activity.end()
}

export { ingestRemoteSchema }
