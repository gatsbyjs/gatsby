import {
  IGroupedQueryIds,
  runPageQueries,
  runStaticQueries,
} from "../../../services"
import { savePartialStateToDisk, store } from "../../../redux"
import { GraphQLRunner } from "../../../query/graphql-runner"
import { getDataStore } from "../../../datastore"
import { setState } from "./state"
import { buildSchema } from "./schema"

export function setComponents(): void {
  setState([`components`, `staticQueryComponents`])
}

export function saveQueries(): void {
  savePartialStateToDisk([`queries`], process.env.GATSBY_WORKER_ID)
}

export async function runQueries(queryIds: IGroupedQueryIds): Promise<void> {
  const workerStore = store.getState()

  // If buildSchema() didn't run yet, execute it
  if (workerStore.schemaCustomization.composer === null) {
    await buildSchema()
  }

  setComponents()

  const graphqlRunner = new GraphQLRunner(store, {
    collectStats: true,
    graphqlTracing: workerStore.program.graphqlTracing,
  })

  await runStaticQueries({
    queryIds,
    store,
    graphqlRunner,
  })

  await runPageQueries({
    queryIds,
    store,
    graphqlRunner,
  })

  await getDataStore().ready()

  saveQueries()
}
