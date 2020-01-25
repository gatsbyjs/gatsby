import { runSteps } from "~/utils/run-steps"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import formatLogMessage from "~/utils/format-log-message"

import checkIfSchemaHasChanged from "./check-if-schema-has-changed"
import introspectAndStoreRemoteSchema from "./introspect-remote-schema"
import identifyAndStoreIngestableFieldsAndTypes from "./identify-and-store-ingestable-types"
import buildNonNodeQueries from "./build-and-store-ingestible-root-field-non-node-queries"
import buildNodeListQueries from "./build-queries-from-introspection/build-node-queries"

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
