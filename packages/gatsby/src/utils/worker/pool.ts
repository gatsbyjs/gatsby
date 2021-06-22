import Worker from "jest-worker"
import { chunk } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { cpuCoreCount } from "gatsby-core-utils"

import type { CreateWorkerPoolType } from "./types"
import { IGroupedQueryIds } from "../../services"

export type GatsbyWorkerPool = CreateWorkerPoolType<typeof import("./child")>

export const create = (): GatsbyWorkerPool => {
  process.env.GATSBY_WORKER_POOL_WORKER = `true`
  const worker = new Worker(require.resolve(`./child`), {
    numWorkers: Math.max(1, cpuCoreCount() - 1),
    forkOptions: {
      silent: false,
    },
  }) as GatsbyWorkerPool
  delete process.env.GATSBY_WORKER_POOL_WORKER
  return worker
}

export async function runQueriesInWorkersQueue(
  pool: GatsbyWorkerPool,
  queryIds: IGroupedQueryIds
): Promise<void> {
  const staticQuerySegments = chunk(queryIds.staticQueryIds, 50)
  const pageQuerySegments = chunk(queryIds.pageQueryIds, 50)

  const activity = reporter.createProgress(
    `run queries in workers`,
    queryIds.staticQueryIds.length + queryIds.pageQueryIds.length
  )
  activity.start()

  const promises: Array<Promise<void>> = []

  for (const segment of staticQuerySegments) {
    promises.push(
      pool
        .runQueries({ pageQueryIds: [], staticQueryIds: segment })
        .then(() => {
          activity.tick(segment.length)
        })
    )
  }

  for (const segment of pageQuerySegments) {
    promises.push(
      pool
        .runQueries({ pageQueryIds: segment, staticQueryIds: [] })
        .then(() => {
          activity.tick(segment.length)
        })
    )
  }

  await Promise.all(promises)

  activity.end()
}
