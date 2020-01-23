import buildNonNodeQueries from "../ingest-remote-schema/build-and-store-ingestible-root-field-non-node-queries"
import buildNodeListQueries from "./build-node-queries"

const buildQueriesSteps = [buildNodeListQueries, buildNonNodeQueries]

const buildAndStoreQueries = async () => {
  for (const buildQueriesStep of buildQueriesSteps) {
    await buildQueriesStep()
  }
}

export default buildAndStoreQueries
