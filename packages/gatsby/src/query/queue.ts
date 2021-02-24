import Queue from "better-queue"
import { store } from "../redux"
import { memoryStoreWithPriorityBuckets } from "../query/better-queue-custom-store"
import { queryRunner } from "../query/query-runner"
import { websocketManager } from "../utils/websocket-manager"
import { GraphQLRunner, IGraphQLRunnerOptions } from "./graphql-runner"
import BetterQueue from "better-queue"
import { ProgressActivityTracker } from "../.."

export type Task = any
type TaskResult = any

if (process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) {
  console.info(
    `GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY: Running with concurrency set to \`${process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY}\``
  )
}

const createBaseOptions = (): Pick<
  BetterQueue.QueueOptions<Task, TaskResult>,
  "concurrent" | "store"
> => {
  return {
    concurrent: Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) || 4,
    store: memoryStoreWithPriorityBuckets<Task>(),
  }
}

const createBuildQueue = (
  graphqlRunner: GraphQLRunner,
  runnerOptions: IGraphQLRunnerOptions = {}
): Queue => {
  if (!graphqlRunner) {
    graphqlRunner = new GraphQLRunner(store, runnerOptions)
  }

  const queueOptions: BetterQueue.QueueOptions<Task, TaskResult> = {
    ...createBaseOptions(),
    async process({ job, activity }, callback): Promise<void> {
      try {
        const result = await queryRunner(graphqlRunner, job, activity?.span)
        callback(null, result)
      } catch (e) {
        callback(e)
      }
    },
  }
  return new Queue(queueOptions)
}

const createDevelopQueue = (getRunner: () => GraphQLRunner): Queue => {
  const queueOptions: BetterQueue.QueueOptions<Task, TaskResult> = {
    ...createBaseOptions(),
    priority: ({ job }, cb): void => {
      if (job.id && websocketManager.activePaths.has(job.id)) {
        cb(null, 10)
      } else {
        cb(null, 1)
      }
    },
    merge: (
      _oldTask: Task,
      newTask: Task,
      cb: (err?: unknown, newTask?: Task) => void
    ): void => {
      cb(null, newTask)
    },
    async process({ job: queryJob, activity }, callback): Promise<void> {
      try {
        const result = await queryRunner(getRunner(), queryJob, activity?.span)
        if (!queryJob.isPage) {
          websocketManager.emitStaticQueryData({
            result,
            id: queryJob.hash,
          })
        }

        callback(null, result)
      } catch (e) {
        callback(e)
      }
    },
  }

  return new Queue(queueOptions)
}

const createAppropriateQueue = (
  graphqlRunner: GraphQLRunner,
  runnerOptions: IGraphQLRunnerOptions = {}
): Queue => {
  if (process.env.NODE_ENV === `production`) {
    return createBuildQueue(graphqlRunner, runnerOptions)
  }
  if (!graphqlRunner) {
    graphqlRunner = new GraphQLRunner(store, runnerOptions)
  }
  return createDevelopQueue(() => graphqlRunner)
}

/**
 * Returns a promise that pushes jobs onto queue and resolves onces
 * they're all finished processing (or rejects if one or more jobs
 * fail)
 * Note: queue is reused in develop so make sure to thoroughly cleanup hooks
 */
const processBatch = async (
  queue: Queue<Task, TaskResult>,
  jobs: Array<Task>,
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

    const taskFailedCallback = (...err: Array<unknown>): void => {
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

export {
  createBuildQueue,
  createDevelopQueue,
  processBatch,
  createAppropriateQueue,
}
