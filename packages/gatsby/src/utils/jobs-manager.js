const uuid = require(`uuid/v4`)
const path = require(`path`)
const hasha = require(`hasha`)
const fs = require(`fs-extra`)
const pDefer = require(`p-defer`)
const slash = require(`slash`)
const { createContentDigest } = require(`gatsby-core-utils`)
const reporter = require(`gatsby-cli/lib/reporter`)
const { store } = require(`../redux`)

let activityForJobs
let activeJobs = 0

/** @type {Map<string, {id: string, deferred: pDefer.DeferredPromise}>} */
const jobsInProcess = new Map()

/**
 * @param {string} path
 * @param {string} rootDir
 * @return {string}
 */
const convertPathsToRelative = (filePath, rootDir) => {
  const relative = path.relative(rootDir, filePath)

  if (relative.includes(`..`)) {
    throw new Error(
      `${filePath} is not inside ${rootDir}. Make sure your files are inside your gatsby project.`
    )
  }

  return slash(relative)
}
/**
 * @param {string} path
 */
const createFileHash = path => hasha.fromFileSync(path, { algorithm: `sha1` })

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
 * @template T
 * @param {function({ inputPaths: Job["inputPaths"], outputDir: Job["outputDir"], args: Job["args"]}): T} workerFn
 * @param {Job} job
 * @return Promise<T>
 */
const runLocalWorker = async (workerFn, job) => {
  await fs.ensureDir(job.outputDir)

  return new Promise((resolve, reject) => {
    // execute worker nextTick
    // TODO should we think about threading/queueing here?
    process.nextTick(() => {
      try {
        Promise.resolve(
          workerFn({
            inputPaths: job.inputPaths,
            outputDir: job.outputDir,
            args: job.args,
          })
        ).then(resolve, reject)
      } catch (err) {
        reject(err)
      }
    })
  })
}

/**
 *
 * @param {AugmentedJob} job
 * @param {Job["plugin"]} plugin
 * @param {pDefer.DeferredPromise} deferred
 */
const runJob = (job, plugin, deferred) => {
  const worker = require(`${plugin.name}/worker.js`)
  if (!worker[job.name]) {
    deferred.reject(new Error(`No worker function found for ${job.name}`))
    return
  }

  runLocalWorker(worker[job.name], job).then(deferred.resolve, deferred.reject)
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
 * @return {Promise<unknown>}
 */
exports.enqueueJob = async ({ name, inputPaths, outputDir, args, plugin }) => {
  const rootDir = store.getState().program.directory

  // TODO see if we can make this async, filehashing might be expensive to wait for
  // When making this async might trigger the phantomactivity multiple times
  const inputPathsWithContentDigest = inputPaths.map(path => {
    return {
      path: convertPathsToRelative(path, rootDir),
      contentDigest: createFileHash(path),
    }
  })

  const job = {
    id: uuid(),
    name,
    inputPaths: inputPathsWithContentDigest,
    outputDir: convertPathsToRelative(outputDir, rootDir),
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

  runJob(job, plugin, deferred)

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

exports.resolveWorker = plugin => {
  try {
    return require.resolve(`${plugin.name}/worker.js`)
  } catch (err) {
    throw new Error(
      `We couldn't find a worker.js file for ${plugin.name}@${plugin.version}`
    )
  }
}
