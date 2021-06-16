import { WorkerPool } from "gatsby-worker"
import { cpuCoreCount } from "gatsby-core-utils"

export type GatsbyWorkerPool = WorkerPool<typeof import("./child")>

export const create = (): GatsbyWorkerPool => {
  const worker = new WorkerPool<typeof import("./child")>(
    require.resolve(`./child`),
    {
      numWorkers: Math.max(1, cpuCoreCount() - 1),
      env: {
        GATSBY_WORKER_POOL_WORKER: `true`,
      },
    }
  )

  return worker
}
