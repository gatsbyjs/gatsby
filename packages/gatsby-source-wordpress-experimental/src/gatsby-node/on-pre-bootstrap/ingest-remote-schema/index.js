import { getGatsbyApi } from "../../../utils/get-gatsby-api"
import formatLogMessage from "../../../utils/format-log-message"

import checkIfSchemaHasChanged from "../check-if-schema-has-changed"
import introspectAndStoreRemoteSchema from "../introspect-remote-schema"
import identifyAndStoreIngestableRootFieldsAndTypes from "./identify-and-store-ingestable-types"
import buildAndStoreIngestibleRootFieldNodeListQueries from "../build-queries-from-introspection"

const ingestionSteps = [
  checkIfSchemaHasChanged,
  introspectAndStoreRemoteSchema,
  identifyAndStoreIngestableRootFieldsAndTypes,
  buildAndStoreIngestibleRootFieldNodeListQueries,
]

const ingestRemoteSchema = async () => {
  const { helpers } = getGatsbyApi()

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`ingest WPGraphQL schema`)
  )

  activity.start()

  for (const ingestionStep of ingestionSteps) {
    await ingestionStep()
  }

  // build node list queries
  // build other root field query

  // use type map to:
  // add node interfaces to schema
  // add node list types to schema
  // add other root field types to schema

  activity.end()
}

export default ingestRemoteSchema
