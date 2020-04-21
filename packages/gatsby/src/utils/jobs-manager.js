const uuid = require(`uuid/v4`)
const path = require(`path`)
const hasha = require(`hasha`)
const fs = require(`fs-extra`)
const pDefer = require(`p-defer`)
const _ = require(`lodash`)
const { createContentDigest, slash } = require(`gatsby-core-utils`)
const reporter = require(`gatsby-cli/lib/reporter`)

const MESSAGE_TYPES = {
  JOB_CREATED: `JOB_CREATED`,
  JOB_COMPLETED: `JOB_COMPLETED`,
  JOB_FAILED: `JOB_FAILED`,
  JOB_NOT_WHITELISTED: `JOB_NOT_WHITELISTED`,
}

let activityForJobs = null
let activeJobs = 0
let isListeningForMessages = false
let hasShownIPCDisabledWarning = false

/** @type {Map<string, {id: string, deferred: pDefer.DeferredPromise<any>}>} */
const jobsInProcess = new Map()
/** @type {Map<string, {job: InternalJob, deferred: pDefer.DeferredPromise<any>}>} */
const externalJobsMap = new Map()

/**
 * We want to use absolute paths to make sure they are on the filesystem
 *
 * @param {string} filePath
 * @return {string}
 */
const convertPathsToAbsolute = filePath => {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`${filePath} should be an absolute path.`)
  }

  return slash(filePath)
}
/**
 * Get contenthash of a file
 *
 * @param {string} path
 */
const createFileHash = path => hasha.fromFileSync(path, { algorithm: `sha1` })

/**
 * @typedef BaseJobInterface
 * @property {string} name
 * @property {string} outputDir,
 * @property {Record<string, any>} args

 * @typedef JobInputInterface
 * @property {string[]} inputPaths
 * @property {{name: string, version: string, resolve: string}} plugin

 * @typedef InternalJobInterface
 * @property {string} id
 * @property {string} contentDigest
 * @property {{path: string, contentDigest: string}[]} inputPaths
 * @property {{name: string, version: string, resolve: string, isLocal: boolean}} plugin
 *
 * I know this sucks but this is the only way to do it properly in jsdoc..
 * @typedef {BaseJobInterface & JobInputInterface} JobInput
 * @typedef {BaseJobInterface & InternalJobInterface} InternalJob
 */

/** @type {pDefer.DeferredPromise<void>|null} */
let hasActiveJobs = null

const hasExternalJobsEnabled = () =>
  process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `true` ||
  process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `1`

/**
 * Get the local worker function and execute it on the user's machine
 *
 * @template T
 * @param {function({ inputPaths: InternalJob["inputPaths"], outputDir: InternalJob["outputDir"], args: InternalJob["args"]}): T} workerFn
 * @param {InternalJob} job
 * @return {Promise<T>}
 */
const runLocalWorker = async (workerFn, job) => {
  await fs.ensureDir(job.outputDir)

  return new Promise((resolve, reject) => {
    // execute worker nextTick
    // TODO should we think about threading/queueing here?
    setImmediate(() => {
      try {
        resolve(
          workerFn({
            inputPaths: job.inputPaths,
            outputDir: job.outputDir,
            args: job.args,
          })
        )
      } catch (err) {
        reject(new WorkerError(err))
      }
    })
  })
}

const listenForJobMessages = () => {
  process.on(`message`, msg => {
    if (
      msg &&
      msg.type &&
      msg.payload &&
      msg.payload.id &&
      externalJobsMap.has(msg.payload.id)
    ) {
      const { job, deferred } = externalJobsMap.get(msg.payload.id)
      switch (msg.type) {
        case MESSAGE_TYPES.JOB_COMPLETED: {
          deferred.resolve(msg.payload.result)
          break
        }
        case MESSAGE_TYPES.JOB_FAILED: {
          deferred.reject(new WorkerError(msg.payload.error))
          break
        }
        case MESSAGE_TYPES.JOB_NOT_WHITELISTED: {
          deferred.resolve(runJob(job, true))
          break
        }
      }

      externalJobsMap.delete(msg.payload.id)
    }
  })
}

/**
 * @param {InternalJob} job
 */
const runExternalWorker = job => {
  const deferred = pDefer()
  externalJobsMap.set(job.id, {
    job,
    deferred,
  })

  process.send({
    type: MESSAGE_TYPES.JOB_CREATED,
    payload: job,
  })

  return deferred.promise
}

/**
 * Make sure we have everything we need to run a job
 * If we do, run it locally.
 * TODO add external job execution through ipc
 *
 * @param {InternalJob} job
 * @return {Promise<object>}
 */
const runJob = (job, forceLocal = false) => {
  const { plugin } = job
  try {
    const worker = require(path.posix.join(plugin.resolve, `gatsby-worker.js`))
    if (!worker[job.name]) {
      throw new Error(`No worker function found for ${job.name}`)
    }

    if (!forceLocal && !job.plugin.isLocal && hasExternalJobsEnabled()) {
      if (process.send) {
        if (!isListeningForMessages) {
          isListeningForMessages = true
          listenForJobMessages()
        }

        return runExternalWorker(job)
      } else {
        // only show the offloading warning once
        if (!hasShownIPCDisabledWarning) {
          hasShownIPCDisabledWarning = true
          reporter.warn(
            `Offloading of a job failed as IPC could not be detected. Running job locally.`
          )
        }
      }
    }
    return runLocalWorker(worker[job.name], job)
  } catch (err) {
    throw new Error(
      `We couldn't find a gatsby-worker.js(${plugin.resolve}/gatsby-worker.js) file for ${plugin.name}@${plugin.version}`
    )
  }
}

/**
 * Create an internal job object
 *
 * @param {JobInput|InternalJob} job
 * @param {{name: string, version: string, resolve: string}} plugin
 * @return {InternalJob}
 */
exports.createInternalJob = (job, plugin) => {
  // It looks like we already have an augmented job so we shouldn't redo this work
  // @ts-ignore
  if (job.id && job.contentDigest) {
    return job
  }

  const { name, inputPaths, outputDir, args } = job

  // TODO see if we can make this async, filehashing might be expensive to wait for
  // currently this needs to be sync as we could miss jobs to have been scheduled and
  // are still processing their hashes
  const inputPathsWithContentDigest = inputPaths.map(path => {
    return {
      path: convertPathsToAbsolute(path),
      contentDigest: createFileHash(path),
    }
  })

  /** @type {InternalJob} */
  const internalJob = {
    id: uuid(),
    name,
    contentDigest: ``,
    inputPaths: inputPathsWithContentDigest,
    outputDir: convertPathsToAbsolute(outputDir),
    args,
    plugin: {
      name: plugin.name,
      version: plugin.version,
      resolve: plugin.resolve,
      isLocal: !plugin.resolve.includes(`/node_modules/`),
    },
  }

  // generate a contentDigest based on all parameters including file content
  internalJob.contentDigest = createContentDigest({
    name: job.name,
    inputPaths: internalJob.inputPaths.map(
      inputPath => inputPath.contentDigest
    ),
    outputDir: internalJob.outputDir,
    args: internalJob.args,
    plugin: internalJob.plugin,
  })

  return internalJob
}

/**
 * Creates a job
 *
 * @param {InternalJob} job
 * @return {Promise<object>}
 */
exports.enqueueJob = async job => {
  // When we already have a job that's executing, return the same promise.
  // we have another check in our createJobV2 action to return jobs that have been done in a previous gatsby run
  if (jobsInProcess.has(job.contentDigest)) {
    return jobsInProcess.get(job.contentDigest).deferred.promise
  }

  if (activeJobs === 0) {
    hasActiveJobs = pDefer()
  }

  // Bump active jobs
  activeJobs++
  if (!activityForJobs) {
    activityForJobs = reporter.phantomActivity(`Running jobs v2`)
    activityForJobs.start()
  }

  const deferred = pDefer()
  jobsInProcess.set(job.contentDigest, {
    id: job.id,
    deferred,
  })

  try {
    const result = await runJob(job)
    // this check is to keep our worker results consistent for cloud
    if (result != null && !_.isPlainObject(result)) {
      throw new Error(
        `Result of a worker should be an object, type of "${typeof result}" was given`
      )
    }
    deferred.resolve(result)
  } catch (err) {
    if (err instanceof Error) {
      deferred.reject(new WorkerError(err.message))
    }

    deferred.reject(new WorkerError(err))
  } finally {
    // when all jobs are done we end the activity
    if (--activeJobs === 0) {
      hasActiveJobs.resolve()
      activityForJobs.end()
      // eslint-disable-next-line require-atomic-updates
      activityForJobs = null
    }
  }

  return deferred.promise
}

/**
 * Get in progress job promise
 *
 * @param {string} contentDigest
 * @return {Promise<void>}
 */
exports.getInProcessJobPromise = contentDigest =>
  jobsInProcess.get(contentDigest)?.deferred.promise

/**
 * Remove a job from our inProgressQueue to reduce memory usage
 *
 * @param {string} contentDigest
 */
exports.removeInProgressJob = contentDigest => {
  jobsInProcess.delete(contentDigest)
}

/**
 * Wait for all processing jobs to have finished
 *
 * @return {Promise<void>}
 */
exports.waitUntilAllJobsComplete = () =>
  hasActiveJobs ? hasActiveJobs.promise : Promise.resolve()

/**
 * @param {Partial<InternalJob>  & {inputPaths: InternalJob['inputPaths']}} job
 * @return {boolean}
 */
exports.isJobStale = job => {
  const areInputPathsStale = job.inputPaths.some(inputPath => {
    // does the inputPath still exists?
    if (!fs.existsSync(inputPath.path)) {
      return true
    }

    // check if we're talking about the same file
    const fileHash = createFileHash(inputPath.path)
    return fileHash !== inputPath.contentDigest
  })

  return areInputPathsStale
}

export class WorkerError extends Error {
  constructor(message) {
    super(message)
    this.name = `WorkerError`

    Error.captureStackTrace(this, WorkerError)
  }
}
