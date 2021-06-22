import { IGroupedQueryIds, runStaticQueries } from "../../../services"
import { store } from "../../../redux"
import { GraphQLRunner } from "../../../query/graphql-runner"
import { getDataStore } from "../../../datastore"
import { setState } from "./state"
import { buildSchema } from "./schema"

export function setQueries(): void {
  setState([`components`, `staticQueryComponents`])
}

export async function runQueries(queryIds: IGroupedQueryIds): Promise<void> {
  const workerStore = store.getState()

  // If buildSchema() didn't run yet, execute it
  if (workerStore.schemaCustomization.composer === null) {
    await buildSchema()
  }

  setQueries()

  const graphqlRunner = new GraphQLRunner(store, {
    collectStats: true,
    graphqlTracing: workerStore.program.graphqlTracing,
  })

  await runStaticQueries({
    queryIds,
    store,
    graphqlRunner,
  })

  await getDataStore().ready()
}
