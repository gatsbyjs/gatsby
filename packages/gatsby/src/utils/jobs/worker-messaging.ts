import pDefer from "p-defer"

import {
  MESSAGE_TYPES,
  InternalJob,
  IJobCreatedMessage,
  WorkerError,
} from "./types"
import { store } from "../../redux"
import { internalActions } from "../../redux/actions"
import { GatsbyWorkerPool } from "../worker/types"
import { isWorker, getMessenger } from "../worker/messaging"

let hasActiveWorkerJobs: pDefer.DeferredPromise<void> | null = null
let activeWorkerJobs = 0

export function initJobsMessagingInMainProcess(
  workerPool: GatsbyWorkerPool
): void {
  workerPool.onMessage((msg, workerId) => {
    if (msg.type === MESSAGE_TYPES.JOB_CREATED) {
      if (activeWorkerJobs === 0) {
        hasActiveWorkerJobs = pDefer<void>()
      }
      activeWorkerJobs++
      store
        .dispatch(internalActions.createJobV2FromInternalJob(msg.payload))
        .then(result => {
          workerPool.sendMessage(
            {
              type: MESSAGE_TYPES.JOB_COMPLETED,
              payload: {
                id: msg.payload.id,
                result,
              },
            },
            workerId
          )
        })
        .catch(error => {
          workerPool.sendMessage(
            {
              type: MESSAGE_TYPES.JOB_FAILED,
              payload: {
                id: msg.payload.id,
                error: error.message,
                stack: error.stack,
              },
            },
            workerId
          )
        })
        .finally(() => {
          if (--activeWorkerJobs === 0) {
            hasActiveWorkerJobs?.resolve()
            hasActiveWorkerJobs = null
          }
        })
    }
  })
}

export const waitUntilWorkerJobsAreComplete = (): Promise<void> =>
  hasActiveWorkerJobs ? hasActiveWorkerJobs.promise : Promise.resolve()

/**
 * This map is ONLY used in worker. It's purpose is to keep track of promises returned to plugins
 * when creating jobs (in worker context), so that we can resolve or reject those once main process
 * send back their status.
 */
const deferredWorkerPromises = new Map<
  InternalJob["id"],
  pDefer.DeferredPromise<Record<string, unknown>>
>()
const gatsbyWorkerMessenger = getMessenger()
export function initJobsMessagingInWorker(): void {
  if (isWorker && gatsbyWorkerMessenger) {
    gatsbyWorkerMessenger.onMessage(msg => {
      if (msg.type === MESSAGE_TYPES.JOB_COMPLETED) {
        const { id, result } = msg.payload
        const deferredPromise = deferredWorkerPromises.get(id)

        if (!deferredPromise) {
          throw new Error(
            `Received message about completed job that wasn't scheduled by this worker`
          )
        }

        deferredPromise.resolve(result)
        deferredWorkerPromises.delete(id)
      } else if (msg.type === MESSAGE_TYPES.JOB_FAILED) {
        const { id, error, stack } = msg.payload
        const deferredPromise = deferredWorkerPromises.get(id)

        if (!deferredPromise) {
          throw new Error(
            `Received message about failed job that wasn't scheduled by this worker`
          )
        }

        const errorObject = new WorkerError(error)
        if (stack) {
          errorObject.stack = stack
        }
        deferredPromise.reject(errorObject)
        deferredWorkerPromises.delete(id)
      }
    })
  }
}

/**
 * Forwards job to main process (if executed in worker context) and returns
 * a promise. Will return `undefined` if called not in worker context.
 */
export function maybeSendJobToMainProcess(
  job: InternalJob
): Promise<Record<string, unknown>> | undefined {
  if (isWorker && gatsbyWorkerMessenger) {
    const deferredWorkerPromise = pDefer<Record<string, unknown>>()

    const msg: IJobCreatedMessage = {
      type: MESSAGE_TYPES.JOB_CREATED,
      payload: job,
    }

    gatsbyWorkerMessenger.sendMessage(msg)

    // holds on to promise
    deferredWorkerPromises.set(job.id, deferredWorkerPromise)

    return deferredWorkerPromise.promise
  }

  return undefined
}
