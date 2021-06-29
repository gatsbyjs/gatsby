import { WorkerPool } from "gatsby-worker"
import { initJobsMessaging } from "../../../jobs-manager"
import type { MessagesFromChild, MessagesFromParent } from "../../messaging"

export type GatsbyTestWorkerPool = WorkerPool<
  typeof import("./child-for-tests"),
  MessagesFromParent,
  MessagesFromChild
>

export function createTestWorker(numWorkers = 1): GatsbyTestWorkerPool {
  const worker: GatsbyTestWorkerPool = new WorkerPool(
    require.resolve(`./child-for-tests`),
    {
      numWorkers,
      env: {
        // We are using JEST_WORKER_ID env so that worker use same test database as
        // jest runner process
        FORCE_TEST_DATABASE_ID: process.env.JEST_WORKER_ID,
        GATSBY_WORKER_POOL_WORKER: `true`,
        NODE_OPTIONS: `--require ${require.resolve(`./ts-register`)}`,
      },
    }
  )

  initJobsMessaging(worker)

  return worker
}
