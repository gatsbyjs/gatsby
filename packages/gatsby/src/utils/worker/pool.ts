import { WorkerPool } from "gatsby-worker"
import { cpuCoreCount } from "gatsby-core-utils"
import { store } from "../../redux"
import { internalActions } from "../../redux/actions"

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

  initJobHandling(worker)

  return worker
}

const workersWithInitatializedJobHandling = new WeakSet()
// exported for tests
export function initJobHandling(workerPool: GatsbyWorkerPool): void {
  if (workersWithInitatializedJobHandling.has(workerPool)) {
    return
  }

  workerPool.onMessage((msg, workerId) => {
    // @ts-ignore TODO: figure out nice typing system for messages
    if (msg.type === `JOB:CREATE`) {
      // @ts-ignore TODO: figure out nice typing system for messages
      const job = msg.payload
      const jobPromise = store.dispatch(
        internalActions.createJobV2FromInternalJob(job)
      )

      jobPromise.then(
        result => {
          workerPool.sendMessage(
            {
              type: `JOB:SUCCESS`,
              payload: { result, jobId: job.id },
            },
            workerId
          )
        },
        error => {
          // console.trace(`great failure`, error)
          workerPool.sendMessage(
            {
              type: `JOB:ERROR`,
              payload: { error, jobId: job.id },
            },
            workerId
          )
        }
      )
    }
  })

  workersWithInitatializedJobHandling.add(workerPool)
}
