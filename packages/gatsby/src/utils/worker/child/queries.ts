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
import {
  IAddPendingPageDataWriteAction,
  ICreatePageDependencyAction,
  IGatsbyState,
  IPageQueryRunAction,
  IQueryStartAction,
} from "../../../redux/types"
import { DeepPartial } from "redux"
import { waitUntilPageQueryResultsAreStored } from "../../page-data"

export function setComponents(): void {
  setState([`components`, `staticQueryComponents`])
}

export async function saveQueriesDependencies(): Promise<void> {
  // Drop `queryNodes` from query state - it can be restored from other pieces of state
  // and is there only as a perf optimization
  const pickNecessaryQueryState = <T extends DeepPartial<IGatsbyState>>(
    state: T
  ): T => {
    if (!state?.queries?.queryNodes) return state
    return { ...state, queries: { ...state.queries, queryNodes: new Map() } }
  }
  savePartialStateToDisk(
    [`queries`, `telemetry`],
    process.env.GATSBY_WORKER_ID,
    pickNecessaryQueryState
  )

  // make sure page query results we put in lmdb-store are flushed
  await waitUntilPageQueryResultsAreStored()
}

let gqlRunner

function getGraphqlRunner(): GraphQLRunner {
  if (!gqlRunner) {
    gqlRunner = new GraphQLRunner(store, {
      collectStats: true,
      graphqlTracing: store.getState().program.graphqlTracing,
    })
  }
  return gqlRunner
}

type ActionsToReplay = Array<
  | IQueryStartAction
  | IPageQueryRunAction
  | IAddPendingPageDataWriteAction
  | ICreatePageDependencyAction
>

export async function runQueries(
  queryIds: IGroupedQueryIds
): Promise<ActionsToReplay> {
  const actionsToReplay: ActionsToReplay = []

  const unsubscribe = store.subscribe(() => {
    const action = store.getState().lastAction
    if (
      action.type === `QUERY_START` ||
      action.type === `PAGE_QUERY_RUN` ||
      action.type === `ADD_PENDING_PAGE_DATA_WRITE`
      // Note: Instead of saving/replaying `CREATE_COMPONENT_DEPENDENCY` action
      // we do state merging once at the end of the query running (replaying this action is expensive)
    ) {
      actionsToReplay.push(action)
    }
  })

  try {
    await doRunQueries(queryIds)
    return actionsToReplay
  } finally {
    unsubscribe()
  }
}

async function doRunQueries(queryIds: IGroupedQueryIds): Promise<void> {
  const workerStore = store.getState()

  // If buildSchema() didn't run yet, execute it
  if (workerStore.schemaCustomization.composer === null) {
    await buildSchema()
  }

  const graphqlRunner = getGraphqlRunner()

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
