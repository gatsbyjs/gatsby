import { runSteps } from "~/utils/run-steps"
import { formatLogMessage } from "~/utils/format-log-message"

import { checkIfSchemaHasChanged } from "./diff-schemas"
import { introspectAndStoreRemoteSchema } from "./introspect-remote-schema"
import { identifyAndStoreIngestableFieldsAndTypes } from "./identify-and-store-ingestable-types"
import { buildNonNodeQueries } from "./build-and-store-ingestible-root-field-non-node-queries"
import { buildNodeQueries } from "./build-queries-from-introspection/build-node-queries"
import { cacheFetchedTypes } from "./cache-fetched-types"
import { writeQueriesToDisk } from "./write-queries-to-disk"
import { withPluginKey } from "~/store"
/**
 * This fn is called during schema customization.
 * It pulls in the remote WPGraphQL schema, caches it,
 * then builds queries and stores a transformed object
 * later used in schema customization.
 *
 * This fn must run in all PQR workers.
 */
const ingestRemoteSchema = async (helpers, pluginOptions) => {
  if (process.env.NODE_ENV === `development`) {
    // running this code block in production is problematic for PQR
    // since this fn will run once for each worker and we need the result in each
    // we'll return early in most workers when it checks the cache here
    // Since PQR doesn't run in development and this code block was only meant for dev
    // it should be ok to wrap it in this if statement
    const schemaTimeKey = withPluginKey(`lastIngestRemoteSchemaTime`)
    const lastIngestRemoteSchemaTime = await helpers.cache.get(schemaTimeKey)

    const ingestedSchemaInLastTenSeconds =
      Date.now() - lastIngestRemoteSchemaTime <= 10000

    if (lastIngestRemoteSchemaTime && ingestedSchemaInLastTenSeconds) {
      // only allow this to run once every ten seconds
      // this prevents thrashing when many webhooks are received at once
      return
    }

    await helpers.cache.set(schemaTimeKey, Date.now())
  }

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
    activity.panic(e)
  } finally {
    activity.end()
  }
}

export { ingestRemoteSchema }
