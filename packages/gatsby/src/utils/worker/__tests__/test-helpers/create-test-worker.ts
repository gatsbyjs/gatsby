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
  process.env.GATSBY_WORKER_POOL_WORKER = `true`

  // deleting process.env.JEST_WORKER_ID is a workaround for `@babel/register` used in `./wrapper-for-tests`
  // creating new Worker without explicitly defining `exposedMethods` result in requiring the module
  // we need a way to recognize when require module is executed in context of process running test
  // versus process(es) spawned for worker. jest-worker actually doesn't have a way to pass custom env vars
  // to worker process without overriding JEST_WORKER_ID (yikes), but it does reuse current process.env
  // so we temporarily unset JEST_WORKER_ID, so that module loaded in the same process as this code is executed
  // doesn't use `@babel/register` and we rely on `jest-worker` auto-assigning JEST_WORKER_ID for child processes
  const tmpJestWorkerId = process.env.JEST_WORKER_ID
  delete process.env.JEST_WORKER_ID

  const worker = new Worker(require.resolve(`./wrapper-for-tests`), {
    numWorkers: 1,
    forkOptions: {
      silent: false,
    },
    maxRetries: 1,
  }) as GatsbyTestWorkerPool
  delete process.env.GATSBY_WORKER_POOL_WORKER
  process.env.JEST_WORKER_ID = tmpJestWorkerId

  return worker
}
