const uuid = require(`uuid/v4`)
const path = require(`path`)
const hasha = require(`hasha`)
const fs = require(`fs-extra`)
const pDefer = require(`p-defer`)
const slash = require(`slash`)
const _ = require(`lodash`)
const { createContentDigest } = require(`gatsby-core-utils`)
const reporter = require(`gatsby-cli/lib/reporter`)

let activityForJobs = null
let activeJobs = 0

/** @type {Map<string, {id: string, deferred: pDefer.DeferredPromise}>} */
const jobsInProcess = new Map()

/**
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

/**
 * @deprecated
 * TODO: Remove for Gatsby v3 (compatibility mode)
 */
exports.jobsInProcess = jobsInProcess

/**
 * @template T
 * @param {function({ inputPaths: InternalJob["inputPaths"], outputDir: InternalJob["outputDir"], args: InternalJob["args"]}): T} workerFn
 * @param {InternalJob} job
 * @return Promise<T>
 */
const runLocalWorker = async (workerFn, job) => {
  await fs.ensureDir(job.outputDir)

  return new Promise((resolve, reject) => {
    // execute worker nextTick
    // TODO should we think about threading/queueing here?
    process.nextTick(() => {
      try {
        resolve(
          workerFn({
            inputPaths: job.inputPaths,
            outputDir: job.outputDir,
            args: job.args,
          })
        )
      } catch (err) {
        reject(err)
      }
    })
  })
}

/**
 *
 * @param {InternalJob} job
 */
const runJob = job => {
  const { plugin } = job
  try {
    const worker = require(path.posix.join(plugin.resolve, `gatsby-worker.js`))
    if (!worker[job.name]) {
      throw new Error(`No worker function found for ${job.name}`)
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
  if (jobsInProcess.has(job.contentDigest)) {
    return jobsInProcess.get(job.contentDigest).deferred.promise
  }

  // Bump active jobs
  activeJobs++
  if (!activityForJobs) {
    activityForJobs = reporter.phantomActivity(`Running jobs`)
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
    deferred.reject(err)
  } finally {
    if (--activeJobs === 0) {
      activityForJobs.end()
      // eslint-disable-next-line require-atomic-updates
      activityForJobs = null
    }
  }

  return deferred.promise
}

/**
 * Wait for all processing jobs to have finished
 *
 * @return {Promise<void>}
 */
exports.waitUntilAllJobsComplete = () => {
  const jobsPromises = []
  jobsInProcess.forEach(({ deferred }) => jobsPromises.push(deferred.promise))

  return Promise.all(jobsPromises).then(() => {})
}

/**
 * @param {Partial<InternalJob>  & {inputPaths: InternalJob['inputPaths']}} job
 * @return {boolean}
 */
exports.isJobStale = job => {
  const areInputPathsStale = job.inputPaths.some(inputPath => {
    if (!fs.existsSync(inputPath.path)) {
      return true
    }

    const fileHash = createFileHash(inputPath.path)
    return fileHash !== inputPath.contentDigest
  })

  return areInputPathsStale
}
