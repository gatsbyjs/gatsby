import { WorkerPool } from "gatsby-worker"
import { chunk } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { cpuCoreCount } from "gatsby-core-utils"
import { Span } from "opentracing"

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
      GATSBY_NODE_GLOBALS: JSON.stringify(global.__GATSBY ?? {}),
      GATSBY_WORKER_POOL_WORKER: `true`,
      GATSBY_SKIP_WRITING_SCHEMA_TO_FILE: `true`,
    },
  })

  initJobsMessagingInMainProcess(worker)
  initReporterMessagingInMainProcess(worker)

  return worker
}

const queriesChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

function handleRunQueriesInWorkersQueueError(e: Error): never {
  reporter.panic({
    id: `85928`,
    context: {},
    error: e,
  })
}

export async function runQueriesInWorkersQueue(
  pool: GatsbyWorkerPool,
  queryIds: IGroupedQueryIds,
  opts?: {
    chunkSize?: number
    parentSpan?: Span
  }
): Promise<void> {
  const activity = reporter.createProgress(
    `run queries in workers`,
    queryIds.staticQueryIds.length + queryIds.pageQueryIds.length,
    0,
    { parentSpan: opts?.parentSpan }
  )
  activity.start()
  try {
    const staticQuerySegments = chunk(
      queryIds.staticQueryIds,
      opts?.chunkSize ?? queriesChunkSize
    )
    const pageQuerySegments = chunk(
      queryIds.pageQueryIds,
      opts?.chunkSize ?? queriesChunkSize
    )

    pool.all.setComponents()

    for (const segment of staticQuerySegments) {
      pool.single
        .runQueries({ pageQueryIds: [], staticQueryIds: segment })
        .then(replayWorkerActions)
        .then(() => {
          activity.tick(segment.length)
        })
        .catch(handleRunQueriesInWorkersQueueError)
    }

    for (const segment of pageQuerySegments) {
      pool.single
        .runQueries({ pageQueryIds: segment, staticQueryIds: [] })
        .then(replayWorkerActions)
        .then(() => {
          activity.tick(segment.length)
        })
        .catch(handleRunQueriesInWorkersQueueError)
    }

    // note that we only await on this and not on anything before (`.setComponents()` or `.runQueries()`)
    // because gatsby-worker will queue tasks internally and worker will never execute multiple tasks at the same time
    // so awaiting `.saveQueriesDependencies()` is enough to make sure `.setComponents()` and `.runQueries()` finished
    await Promise.all(pool.all.saveQueriesDependencies())
  } catch (e) {
    handleRunQueriesInWorkersQueueError(e)
  } finally {
    activity.end()
  }
}

export async function mergeWorkerState(
  pool: GatsbyWorkerPool,
  parentSpan?: Span
): Promise<void> {
  const activity = reporter.activityTimer(`Merge worker state`, { parentSpan })
  activity.start()

  for (const { workerId } of pool.getWorkerInfo()) {
    const state = loadPartialStateFromDisk(
      [`queries`, `telemetry`],
      String(workerId)
    )
    console.log(`in worker pool handler`, state)
    const queryStateChunk = state.queries as IGatsbyState["queries"]
    const queryStateTelemetryChunk =
      state.telemetry as IGatsbyState["telemetry"]
    if (queryStateChunk) {
      // When there are too little queries, some worker can be inactive and its state is empty
      store.dispatch({
        type: `MERGE_WORKER_QUERY_STATE`,
        payload: {
          workerId,
          queryStateChunk,
          queryStateTelemetryChunk,
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
