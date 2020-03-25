const Queue = require(`better-queue`)
const { store } = require(`../redux`)
const FastMemoryStore = require(`../query/better-queue-custom-store`)
const queryRunner = require(`../query/query-runner`)
const websocketManager = require(`../utils/websocket-manager`)
const GraphQLRunner = require(`./graphql-runner`).default

const createBaseOptions = () => {
  return {
    concurrent: Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) || 4,
    // eslint-disable-next-line new-cap
    store: FastMemoryStore(),
  }
}

const createBuildQueue = graphqlRunner => {
  if (!graphqlRunner) {
    graphqlRunner = new GraphQLRunner(store)
  }
  const handler = (queryJob, callback) =>
    queryRunner(graphqlRunner, queryJob)
      .then(result => callback(null, result))
      .catch(callback)
  const queue = new Queue(handler, createBaseOptions())
  return queue
}

const createDevelopQueue = getRunner => {
  const queueOptions = {
    ...createBaseOptions(),
    priority: (job, cb) => {
      if (job.id && websocketManager.activePaths.has(job.id)) {
        cb(null, 10)
      } else {
        cb(null, 1)
      }
    },
    merge: (oldTask, newTask, cb) => {
      cb(null, newTask)
    },
  }

  const handler = (queryJob, callback) => {
    queryRunner(getRunner(), queryJob).then(
      result => {
        if (queryJob.isPage) {
          websocketManager.emitPageData({
            result,
            id: queryJob.id,
          })
        } else {
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
const processBatch = async (queue, jobs, activity) => {
  if (jobs.length === 0) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    let taskFinishCallback
    if (activity.tick) {
      taskFinishCallback = () => activity.tick()
      queue.on(`task_finish`, taskFinishCallback)
    }

    const taskFailedCallback = (...err) => {
      gc()
      reject(err)
    }

    const drainCallback = () => {
      gc()
      resolve()
    }

    const gc = () => {
      queue.off(`task_failed`, taskFailedCallback)
      queue.off(`drain`, drainCallback)
      if (taskFinishCallback) {
        queue.off(`task_finish`, taskFinishCallback)
      }
      queue = null
    }

    queue
      // Note: the first arg is the path, the second the error
      .on(`task_failed`, taskFailedCallback)
      // Note: `drain` fires when all tasks _finish_
      //       `empty` fires when queue is empty (but tasks are still running)
      .on(`drain`, drainCallback)

    jobs.forEach(job => queue.push(job))
  })
}

module.exports = {
  createBuildQueue,
  createDevelopQueue,
  processBatch,
}
