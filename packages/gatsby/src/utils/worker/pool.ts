import { WorkerPool } from "gatsby-worker"
import { chunk } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { cpuCoreCount } from "gatsby-core-utils"

import { IGroupedQueryIds } from "../../services"
import { initJobsMessagingInMainProcess } from "../jobs/worker-messaging"
import { initReporterMessagingInMainProcess } from "./reporter"

import { GatsbyWorkerPool } from "./types"
import { loadPartialStateFromDisk, store } from "../../redux"
import { ActionsUnion, IGatsbyState } from "../../redux/types"

export type { GatsbyWorkerPool }

export const create = (): GatsbyWorkerPool => {
  const numWorkers = Math.max(1, cpuCoreCount() - 1)
  reporter.verbose(`Creating ${numWorkers} worker`)

  const worker: GatsbyWorkerPool = new WorkerPool(require.resolve(`./child`), {
    numWorkers,
    env: {
      GATSBY_WORKER_POOL_WORKER: `true`,
    },
  })

  initJobsMessagingInMainProcess(worker)
  initReporterMessagingInMainProcess(worker)

  return worker
}

const queriesChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

export async function runQueriesInWorkersQueue(
  pool: GatsbyWorkerPool,
  queryIds: IGroupedQueryIds,
  chunkSize = queriesChunkSize
): Promise<void> {
  const staticQuerySegments = chunk(queryIds.staticQueryIds, chunkSize)
  const pageQuerySegments = chunk(queryIds.pageQueryIds, chunkSize)

  const activity = reporter.createProgress(
    `run queries in workers`,
    queryIds.staticQueryIds.length + queryIds.pageQueryIds.length
  )
  activity.start()

  const promises: Array<Promise<void>> = []

  for (const segment of staticQuerySegments) {
    promises.push(
      pool.single
        .runQueries({ pageQueryIds: [], staticQueryIds: segment })
        .then(replayWorkerActions)
        .then(() => {
          activity.tick(segment.length)
        })
    )
  }

  for (const segment of pageQuerySegments) {
    promises.push(
      pool.single
        .runQueries({ pageQueryIds: segment, staticQueryIds: [] })
        .then(replayWorkerActions)
        .then(() => {
          activity.tick(segment.length)
        })
    )
  }

  Promise.all(promises)
  await Promise.all(pool.all.saveQueriesDependencies())
  activity.end()
}

export async function mergeWorkerState(pool: GatsbyWorkerPool): Promise<void> {
  const activity = reporter.activityTimer(`Merge worker state`)
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
