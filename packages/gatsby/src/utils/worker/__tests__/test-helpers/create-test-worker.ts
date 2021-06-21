import { WorkerPool } from "gatsby-worker"
import { initJobHandling } from "../../pool"

export type GatsbyTestWorkerPool = WorkerPool<
  typeof import("./child-for-tests")
>

export function createTestWorker(numWorkers = 1): GatsbyTestWorkerPool {
  const worker = new WorkerPool<typeof import("./child-for-tests")>(
    require.resolve(`./wrapper-for-tests`),
    {
      numWorkers,
      env: {
        FORCE_TEST_DATABASE_ID: process.env.JEST_WORKER_ID,
        GATSBY_WORKER_POOL_WORKER: `true`,
      },
    }
  ) as GatsbyTestWorkerPool

  initJobHandling(worker)

  return worker
}
