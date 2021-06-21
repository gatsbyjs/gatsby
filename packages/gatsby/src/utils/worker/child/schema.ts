import {
  IGroupedQueryIds,
  runPageQueries,
  runStaticQueries,
} from "../../../services"
import { GraphQLRunner } from "../../../query/graphql-runner"
import { store } from "../../../redux"
import { build } from "../../../schema"
import { getDataStore } from "../../../datastore"
import apiRunnerNode from "../../api-runner-node"
import { setState } from "./state"

export function setInferenceMetadata(): void {
  setState([`inferenceMetadata`])
}

export function setQueries(): void {
  setState([`components`, `staticQueryComponents`])
}

export async function buildSchema(): Promise<void> {
  const workerStore = store.getState()

  if (!workerStore?.config?.plugins) {
    throw Error(
      `Config loading didn't finish before attempting to build schema in worker`
    )
  }

  setInferenceMetadata()

  await apiRunnerNode(`createSchemaCustomization`)

  await build({ fullMetadataBuild: false, parentSpan: {} })
}

export async function runQueries(queryIds: IGroupedQueryIds): Promise<void> {
  const workerStore = store.getState()

  // If buildSchema() didn't run yet, execute it
  if (workerStore.schemaCustomization.composer === null) {
    await buildSchema()
  }

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
}
