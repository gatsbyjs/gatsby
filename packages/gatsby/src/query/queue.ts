import Queue from "better-queue"
import { store } from "../redux"
import { MemoryStoreWithPriorityBuckets } from "../query/better-queue-custom-store"
import { queryRunner } from "../query/query-runner"
import { websocketManager } from "../utils/websocket-manager"
import { GraphQLRunner } from "./graphql-runner"
import BetterQueue from "better-queue"
import { IExecutionResult } from "./types"
import { ProgressActivityTracker } from "../.."

export type Task = any
type TaskResult = any

const createBaseOptions = (): Partial<
  BetterQueue.QueueOptions<Task, TaskResult>
> => {
  return {
    concurrent: Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) || 4,
    // eslint-disable-next-line new-cap
    store: MemoryStoreWithPriorityBuckets<Task>(),
  }
}

const createBuildQueue = (
  graphqlRunner: GraphQLRunner,
  runnerOptions = {}
): Queue => {
  if (!graphqlRunner) {
    graphqlRunner = new GraphQLRunner(store, runnerOptions)
  }
  const handler = ({ job, activity }, callback): Promise<IExecutionResult> =>
    queryRunner(graphqlRunner, job, activity?.span)
      .then(result => callback(null, result))
      .catch(callback)
  const queue = new Queue(handler, createBaseOptions())
  return queue
}

const createDevelopQueue = (getRunner: () => GraphQLRunner): Queue => {
  const queueOptions = {
    ...createBaseOptions(),
    priority: ({ job }, cb): void => {
      if (job.id && websocketManager.activePaths.has(job.id)) {
        cb(null, 10)
      } else {
        cb(null, 1)
      }
    },
    merge: (
      oldTask: Task,
      newTask: Task,
      cb: (err?: unknown, newTask?: Task) => void
    ): void => {
      cb(null, newTask)
    },
  }

  const handler = ({ job: queryJob, activity }, callback): void => {
    queryRunner(getRunner(), queryJob, activity?.span).then(
      result => {
        if (!queryJob.isPage) {
          websocketManager.emitStaticQueryData({
            result,
            id: queryJob.id,
          })
        }

        callback(null, result)
      },
      error => callback(error)
    )
  }

  return new Queue(handler, queueOptions)
}

/**
 * Returns a promise that pushes jobs onto queue and resolves onces
 * they're all finished processing (or rejects if one or more jobs
 * fail)
 * Note: queue is reused in develop so make sure to thoroughly cleanup hooks
 */
const processBatch = async (
  queue: Queue<Task, TaskResult>,
  jobs: Task[],
  activity: ProgressActivityTracker
): Promise<unknown> => {
  if (jobs.length === 0) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    let taskFinishCallback

    const gc = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      queue.off(`task_failed`, taskFailedCallback)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      queue.off(`drain`, drainCallback)
      if (taskFinishCallback) {
        queue.off(`task_finish`, taskFinishCallback)
      }
      // We don't want to allow the variable to be null any other time,
      // just when marking it as eligible for garbage collection.
      // @ts-ignore
      queue = null
    }

    if (activity.tick) {
      taskFinishCallback = (): unknown => activity.tick()
      queue.on(`task_finish`, taskFinishCallback)
    }

    const taskFailedCallback = (...err: unknown[]): void => {
      gc()
      reject(err)
    }

    const drainCallback = (): void => {
      gc()
      resolve()
    }

    queue
      // Note: the first arg is the path, the second the error
      .on(`task_failed`, taskFailedCallback)
      // Note: `drain` fires when all tasks _finish_
      //       `empty` fires when queue is empty (but tasks are still running)
      .on(`drain`, drainCallback)

    jobs.forEach(job =>
      queue.push({
        job,
        activity,
      })
    )
  })
}

export { createBuildQueue, createDevelopQueue, processBatch }
