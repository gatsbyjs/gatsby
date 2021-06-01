import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"
import { IGatsbyState } from "../../redux/types"
import {
  setProgram,
  setInferenceMetadata,
  setExtractedQueries,
  dispatchActionFromWorkers,
  initMessaging,
  // applyDataDependencies,
} from "./shared-db"
import reporter from "gatsby-cli/lib/reporter"

import { IGatsbyWorkerPool, IWorkerRunAllContext } from "./types"
import type { IGroupedQueryIds } from "../../services/types"

export { IGatsbyWorkerPool }

export const numWorkers = Math.max(1, cpuCoreCount() - 1)

function isIWorkerRunAllContext(arg: any): arg is IWorkerRunAllContext {
  return typeof arg === `object` && typeof arg.workerId === `string`
}

export const create = (): IGatsbyWorkerPool => {
  const worker = new Worker(require.resolve(`./child`), {
    numWorkers,
    forkOptions: {
      silent: false,
    },
    maxRetries: 1,
    computeWorkerKey(method, ...args): string | null {
      if (
        (method === `buildSchema` ||
          method === `loadConfig` ||
          method === `warmup` ||
          method === `setExtractedQueries`) &&
        args.length > 0 &&
        isIWorkerRunAllContext(args[0])
      ) {
        // so jest-worker doesn't really have a way to run same method on all workers
        // this tries to generate different workerKey so that when we call buildSchema
        // as many times as we have workers - I'm not sure if that would guarantee that
        // even gives any guarantees :shrug:

        return args[0].workerId
      }

      return null
    },
  }) as IGatsbyWorkerPool

  initMessaging(true, numWorkers)

  // console.log(`[warmup call] main`)
  runInAllWorkers(workerId => worker.warmup({ workerId }))

  return worker
}

async function runInAllWorkers(fn: (workerId: string) => any): Promise<void> {
  const promises: Array<Promise<void>> = []

  for (let i = 1; i <= numWorkers; i++) {
    promises.push(fn(i.toString()))
  }

  await Promise.all(promises)
}

export async function loadConfigInWorkers(
  pool: IGatsbyWorkerPool,
  program: IGatsbyState["program"]
): Promise<void> {
  if (process.env.GATSBY_BUILD_SCHEMA_IN_DIFF_PROC) {
    const act = reporter.activityTimer(`loadConfigInWorkers`)
    act.start()
    await setProgram(program)
    // console.log(`[loadConfig call] main`)
    await runInAllWorkers(workerId => pool.loadConfig({ workerId }))
    act.end()
  } else {
    reporter.info(`here we would load config in workers`)
  }
}

export async function buildSchemaInWorkers(
  pool: IGatsbyWorkerPool,
  inferenceMetadata: IGatsbyState["inferenceMetadata"]
): Promise<void> {
  if (process.env.GATSBY_BUILD_SCHEMA_IN_DIFF_PROC) {
    const act = reporter.activityTimer(`${Date.now()} buildSchemaInWorkers`)
    act.start()
    await setInferenceMetadata(inferenceMetadata)
    // console.log(`[buildSchema call] main`)
    await runInAllWorkers(workerId => pool.buildSchema({ workerId }))
    act.end()
  } else {
    reporter.info(`here we would build schema in workers`)
  }
}

export async function setExtractedQueriesInWorkers(
  pool: IGatsbyWorkerPool,
  components: IGatsbyState["components"],
  staticQueryComponents: IGatsbyState["staticQueryComponents"]
): Promise<void> {
  if (process.env.GATSBY_BUILD_SCHEMA_IN_DIFF_PROC) {
    const act = reporter.activityTimer(
      `${Date.now()} setExtractedQueriesInWorkers`
    )
    act.start()
    await setExtractedQueries(components, staticQueryComponents)
    // console.log(`[setExtractedQueries call] main`)
    await runInAllWorkers(workerId => pool.setExtractedQueries({ workerId }))
    act.end()
  } else {
    reporter.info(`here we would set extracted queries in workers`)
  }
}

const maxBatchSize = 50

function initBatch(): IGroupedQueryIds {
  return {
    staticQueryIds: [],
    pageQueryIds: [],
  }
}

export async function runQueriesInWorkers(
  pool: IGatsbyWorkerPool,
  queryIds: IGroupedQueryIds
): Promise<void> {
  let currentBatchSize = 0
  let currentBatch = initBatch()

  function getBatchLength(batch: IGroupedQueryIds): number {
    return batch.pageQueryIds.length + batch.staticQueryIds.length
  }

  const activity = reporter.createProgress(
    `run queries in workers`,
    getBatchLength(queryIds)
  )
  activity.start()

  const promises: Array<Promise<void>> = []

  // console.log(`[runQueries call] main`)

  for (const staticQueryId of queryIds.staticQueryIds) {
    currentBatch.staticQueryIds.push(staticQueryId)

    currentBatchSize++
    if (currentBatchSize >= maxBatchSize) {
      promises.push(
        pool.runQueries(currentBatch).then(() => {
          activity.tick(getBatchLength(currentBatch))
        })
      )
      currentBatch = initBatch()
      currentBatchSize = 0
    }
  }

  for (const pageQueryId of queryIds.pageQueryIds) {
    currentBatch.pageQueryIds.push(pageQueryId)

    currentBatchSize++
    if (currentBatchSize >= maxBatchSize) {
      promises.push(
        pool.runQueries(currentBatch).then(() => {
          activity.tick(getBatchLength(currentBatch))
        })
      )
      currentBatch = initBatch()
      currentBatchSize = 0
    }
  }

  if (currentBatchSize > 0) {
    promises.push(
      pool.runQueries(currentBatch).then(() => {
        activity.tick(getBatchLength(currentBatch))
      })
    )
  }

  await Promise.all(promises)

  activity.end()

  dispatchActionFromWorkers()
}
