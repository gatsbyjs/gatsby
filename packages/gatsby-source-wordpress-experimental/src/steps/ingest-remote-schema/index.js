import { runSteps } from "~/utils/run-steps"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import formatLogMessage from "~/utils/format-log-message"

import checkIfSchemaHasChanged from "~/steps/ingest-remote-schema/check-if-schema-has-changed"
import introspectAndStoreRemoteSchema from "~/steps/ingest-remote-schema/introspect-remote-schema"
import identifyAndStoreIngestableFieldsAndTypes from "~/steps/ingest-remote-schema/identify-and-store-ingestable-types"
import buildNonNodeQueries from "~/steps/ingest-remote-schema/build-and-store-ingestible-root-field-non-node-queries"
import buildNodeListQueries from "~/steps/ingest-remote-schema/build-queries-from-introspection/build-node-queries"

const ingestRemoteSchema = async () => {
  const { helpers } = getGatsbyApi()

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`ingest WPGraphQL schema`)
  )

  activity.start()

  await runSteps([
    checkIfSchemaHasChanged,
    introspectAndStoreRemoteSchema,
    identifyAndStoreIngestableFieldsAndTypes,
    buildNodeListQueries,
    buildNonNodeQueries,
  ])

  activity.end()
}

export default ingestRemoteSchema
