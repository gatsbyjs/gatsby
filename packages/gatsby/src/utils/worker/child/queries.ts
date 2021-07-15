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
  IPageQueryRunAction,
  IQueryStartAction,
} from "../../../redux/types"

export function setComponents(): void {
  setState([`components`, `staticQueryComponents`])
}

export function saveQueries(): void {
  savePartialStateToDisk([`queries`], process.env.GATSBY_WORKER_ID)
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
      action.type === `ADD_PENDING_PAGE_DATA_WRITE` ||
      action.type === `CREATE_COMPONENT_DEPENDENCY`
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

  setComponents()

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
