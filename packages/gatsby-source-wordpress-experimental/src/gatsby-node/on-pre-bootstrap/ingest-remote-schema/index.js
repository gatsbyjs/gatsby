import { getGatsbyApi } from "../../../utils/get-gatsby-api"
import formatLogMessage from "../../../utils/format-log-message"

import checkIfSchemaHasChanged from "../check-if-schema-has-changed"
import introspectAndStoreRemoteSchema from "../introspect-remote-schema"
import identifyAndStoreIngestableFieldsAndTypes from "./identify-and-store-ingestable-types"
import buildAndStoreQueries from "../build-queries-from-introspection"

const ingestionSteps = [
  checkIfSchemaHasChanged,
  introspectAndStoreRemoteSchema,
  identifyAndStoreIngestableFieldsAndTypes,
  buildAndStoreQueries,
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

  activity.end()
}

export default ingestRemoteSchema
