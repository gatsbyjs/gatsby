import { WorkerPool } from "gatsby-worker"

export type GatsbyTestWorkerPool = WorkerPool<
  typeof import("./child-for-tests")
>

export function createTestWorker(): GatsbyTestWorkerPool {
  const worker = new WorkerPool<typeof import("./child-for-tests")>(
    require.resolve(`./wrapper-for-tests`),
    {
      numWorkers: 1,
      env: {
        FORCE_TEST_DATABASE_ID: process.env.JEST_WORKER_ID,
        GATSBY_WORKER_POOL_WORKER: `true`,
      },
    }
  ) as GatsbyTestWorkerPool

  return worker
}
