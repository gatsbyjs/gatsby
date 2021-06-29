import { WorkerPool } from "gatsby-worker"
import { chunk } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { cpuCoreCount } from "gatsby-core-utils"

import { IGroupedQueryIds } from "../../services"
import { initJobsMessaging } from "../jobs-manager"
import type { MessagesFromChild, MessagesFromParent } from "./messaging"

export type GatsbyWorkerPool = WorkerPool<
  typeof import("./child"),
  MessagesFromParent,
  MessagesFromChild
>

export const create = (): GatsbyWorkerPool => {
  const worker: GatsbyWorkerPool = new WorkerPool(require.resolve(`./child`), {
    numWorkers: Math.max(1, cpuCoreCount() - 1),
    env: {
      GATSBY_WORKER_POOL_WORKER: `true`,
    },
  })

  initJobsMessaging(worker)

  return worker
}

export async function runQueriesInWorkersQueue(
  pool: GatsbyWorkerPool,
  queryIds: IGroupedQueryIds,
  chunkSize = 50
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
        .then(() => {
          activity.tick(segment.length)
        })
    )
  }

  for (const segment of pageQuerySegments) {
    promises.push(
      pool.single
        .runQueries({ pageQueryIds: segment, staticQueryIds: [] })
        .then(() => {
          activity.tick(segment.length)
        })
    )
  }

  await Promise.all(promises)

  activity.end()
}
