import Worker from "jest-worker"
import type { CreateWorkerPoolType } from "../../types"

export type GatsbyTestWorkerPool = CreateWorkerPoolType<
  typeof import("./child-for-tests")
>

export function createTestWorker(): GatsbyTestWorkerPool {
  // all child processes of this worker pool would have JEST_WORKER_ID set to 1
  // but running jest tests would create processes with possibly other IDs
  // this will let child processes use same database ID as parent process (one that executes test)
  process.env.FORCE_TEST_DATABASE_ID = process.env.JEST_WORKER_ID

  const worker = new Worker(require.resolve(`./wrapper-for-tests`), {
    numWorkers: 1,
    forkOptions: {
      silent: false,
    },
    maxRetries: 1,
  }) as GatsbyTestWorkerPool
  return worker
}
