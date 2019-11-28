const uuid = require(`uuid/v4`)
const hasha = require(`hasha`)
const pDefer = require(`p-defer`)
const { createContentDigest } = require(`gatsby-core-utils`)
const reporter = require(`gatsby-cli/lib/reporter`)

let activityForJobs
let activeJobs = 0

/** @type {Map<string, {id: string, deferred: pDefer.DeferredPromise}>} */
const jobsInProcess = new Map()

/**
 * @param {string} path
 * @return {string}
 */
const convertPathsToRelative = path => path
/**
 * @param {string} path
 */
const createFileHash = path => hasha.fromFile(path, { algorithm: `sha1` })

/**
 * @typedef Job
 * @property {string} name
 * @property {string[]} inputPaths
 * @property {string} outputDir,
 * @property {Record<string, *>} args
 * @property {{name: string, version: string}} plugin
 */

/**
 * @typedef {Job} AugmentedJob
 * @property {string} id
 * @property {{path: string, contentDigest: string}[]} inputPaths
 */

/**
 * @deprecated
 * TODO: Remove for Gatsby v3 (compatibility mode)
 */
exports.jobsInProcess = jobsInProcess

/**
 *
 * @param {AugmentedJob} job
 * @param {pDefer.DeferredPromise} deferred
 */
const runJob = (job, deferred) => {
  setTimeout(() => {
    // TODO do worker implementation
    deferred.resolve(`1`)
  }, 100)
}

const handleJobEnded = () => {
  if (--activeJobs === 0) {
    activityForJobs.end()
    activityForJobs = null
  }
}

/**
 * Creates a job
 *
 * @param {Job} args
 */
exports.enqueueJob = async ({ name, inputPaths, outputDir, args, plugin }) => {
  const inputPathsWithContentDigest = await Promise.all(
    inputPaths.map(async path => {
      return {
        path: convertPathsToRelative(path),
        contentDigest: await createFileHash(path),
      }
    })
  )

  const job = {
    id: uuid(),
    name,
    inputPaths: inputPathsWithContentDigest,
    outputDir: convertPathsToRelative(outputDir),
    args,
    plugin,
  }

  job.contentDigest = createContentDigest({
    name: job.name,
    inputPaths: job.inputPaths.map(inputPath => inputPath.contentDigest),
    outputDir: job.outputDir,
    args: job.args,
    plugin: job.plugin,
  })

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

  // TODO: check cache folder for already stored jobs
  const deferred = pDefer()
  // node 8 doenst have finally so we call then & catch
  deferred.promise = deferred.promise
    .catch(err => {
      handleJobEnded()

      throw err
    })
    .then(res => {
      handleJobEnded()

      return res
    })

  jobsInProcess.set(job.contentDigest, {
    id: job.id,
    deferred,
  })

  runJob(job, deferred)

  return deferred.promise
}

/**
 * Wait for all processing jobs to have finished
 *
 * @return {Promise<void>}
 */
exports.waitUntilAllJobsComplete = () => {
  const jobsPromises = []
  jobsInProcess.forEach(({ deferred }) => jobsPromises.push(deferred))

  return Promise.all(jobsPromises).then(() => {})
}
