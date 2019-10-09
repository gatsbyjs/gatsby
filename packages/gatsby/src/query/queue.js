const Queue = require(`better-queue`)
const { store } = require(`../redux`)
const FastMemoryStore = require(`../query/better-queue-custom-store`)
const queryRunner = require(`../query/query-runner`)
const websocketManager = require(`../utils/websocket-manager`)
const GraphQLRunner = require(`./graphql-runner`)

const createBaseOptions = () => {
  return {
    concurrent: 4,
    store: FastMemoryStore(),
  }
}

const createBuildQueue = () => {
  const graphqlRunner = new GraphQLRunner(store)
  const handler = (queryJob, callback) =>
    queryRunner(graphqlRunner, queryJob)
      .then(result => callback(null, result))
      .catch(callback)
  return new Queue(handler, createBaseOptions())
}

const createDevelopQueue = getRunner => {
  let queue
  const processing = new Set()
  const waiting = new Map()

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
    // Filter out new query jobs if that query is already running.
    // When the query finshes, it checks the waiting map and pushes
    // another job to make sure all the user changes are captured.
    filter: (job, cb) => {
      if (processing.has(job.id)) {
        waiting.set(job.id, job)
        cb(`already running`)
      } else {
        cb(null, job)
      }
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

        processing.delete(queryJob.id)
        if (waiting.has(queryJob.id)) {
          queue.push(waiting.get(queryJob.id))
          waiting.delete(queryJob.id)
        }
        callback(null, result)
      },
      error => callback(error)
    )
  }

  queue = new Queue(handler, queueOptions)
  return queue
}

const pushJob = (queue, job) =>
  new Promise((resolve, reject) =>
    queue
      .push(job)
      .on(`finish`, resolve)
      .on(`failed`, reject)
  )

/**
 * Returns a promise that pushes jobs onto queue and resolves onces
 * they're all finished processing (or rejects if one or more jobs
 * fail)
 */
const processBatch = async (queue, jobs) => {
  let numJobs = jobs.length
  if (numJobs === 0) {
    return Promise.resolve()
  }
  const runningJobs = jobs.map(job => pushJob(queue, job))
  return await Promise.all(runningJobs)
}

module.exports = {
  createBuildQueue,
  createDevelopQueue,
  processBatch,
}
