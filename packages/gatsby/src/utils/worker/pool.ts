import { WorkerPool } from "gatsby-worker"
import { chunk } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { cpuCoreCount } from "gatsby-core-utils"

import { IGroupedQueryIds } from "../../services"
import { initJobsMessagingInMainProcess } from "../jobs/worker-messaging"
import { initReporterMessagingInMainProcess } from "./reporter"

import { GatsbyWorkerPool } from "./types"
import { emitter, loadPartialStateFromDisk, store } from "../../redux"
import { ActionsUnion, IGatsbyState } from "../../redux/types"

export type { GatsbyWorkerPool }

let workerPool: GatsbyWorkerPool
export const create = (): GatsbyWorkerPool => {
  if (workerPool) {
    return workerPool
  } else {
    const numWorkers = Math.max(1, cpuCoreCount() - 1)
    // const numWorkers = 4
    reporter.verbose(`Creating ${numWorkers} worker`)

    workerPool = new WorkerPool(require.resolve(`./child`), {
      numWorkers,
      env: {
        GATSBY_WORKER_POOL_WORKER: `true`,
        GATSBY_SKIP_WRITING_SCHEMA_TO_FILE: `true`,
        GATSBY_EXPERIMENTAL_LMDB_STORE: `true`,
        GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING: `true`,
      },
    })

    initJobsMessagingInMainProcess(workerPool)
    initReporterMessagingInMainProcess(workerPool)

    return workerPool
  }
}

const queriesChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

let nodesChanged = []

emitter.on(`CREATE_NODE`, action => {
  nodesChanged.push(action.payload.id)
})

let initialRun = true
export async function runQueriesInWorkersQueue(
  pool: GatsbyWorkerPool,
  queryIds: IGroupedQueryIds,
  chunkSize = queriesChunkSize,
  parentSpan
): Promise<void> {
  const staticQuerySegments = chunk(queryIds.staticQueryIds, chunkSize)
  const pageQuerySegments = chunk(queryIds.pageQueryIds, chunkSize)
  console.log(`runQueriesInWorkersQueue`, {
    staticQueriesCount: staticQuerySegments.length,
    pageQueriesCount: pageQuerySegments.length,
  })

  const activity = reporter.createProgress(
    `run queries in workers`,
    queryIds.staticQueryIds.length + queryIds.pageQueryIds.length,
    0,
    { parentSpan }
  )
  activity.start()

  pool.all.setComponents()
  if (!initialRun) {
    console.log({ initialRun, nodesChanged })
    pool.all.resetCache(nodesChanged)
  }
  initialRun = false
  nodesChanged = []

  for (const segment of staticQuerySegments) {
    pool.single
      .runQueries({ pageQueryIds: [], staticQueryIds: segment })
      .then(replayWorkerActions)
      .then(() => {
        activity.tick(segment.length)
      })
  }

  for (const [index, segment] of pageQuerySegments.entries()) {
    // console.time(`runQueries ${index}`)
    pool.single
      .runQueries({ pageQueryIds: segment, staticQueryIds: [] })
      .then(replayWorkerActions)
      .then(() => {
        activity.tick(segment.length)
      })
    // console.timeEnd(`runQueries ${index}`)
  }

  // note that we only await on this and not on anything before (`.setComponents()` or `.runQueries()`)
  // because gatsby-worker will queue tasks internally and worker will never execute multiple tasks at the same time
  // so awaiting `.saveQueriesDependencies()` is enough to make sure `.setComponents()` and `.runQueries()` finished
  await Promise.all(pool.all.saveQueriesDependencies())
  activity.end()
}

export async function mergeWorkerState(
  pool: GatsbyWorkerPool,
  parentSpan
): Promise<void> {
  const activity = reporter.activityTimer(`Merge worker state`, { parentSpan })
  activity.start()

  for (const { workerId } of pool.getWorkerInfo()) {
    const state = loadPartialStateFromDisk([`queries`], String(workerId))
    const queryStateChunk = state.queries as IGatsbyState["queries"]
    if (queryStateChunk) {
      // When there are too little queries, some worker can be inactive and its state is empty
      store.dispatch({
        type: `MERGE_WORKER_QUERY_STATE`,
        payload: {
          workerId,
          queryStateChunk,
        },
      })
      await new Promise(resolve => process.nextTick(resolve))
    }
  }
  activity.end()
}

async function replayWorkerActions(
  actions: Array<ActionsUnion>
): Promise<void> {
  let i = 1
  for (const action of actions) {
    store.dispatch(action)

    // Give event loop some breath
    if (i++ % 100 === 0) {
      await new Promise(resolve => process.nextTick(resolve))
    }
  }
}
