import uuidv4 from "uuid/v4"
import path from "path"
import hasha from "hasha"
import fs from "fs-extra"
import pDefer from "p-defer"
import _ from "lodash"
import { createContentDigest, slash } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import { IPhantomReporter } from "gatsby-cli"

enum MESSAGE_TYPES {
  JOB_CREATED = `JOB_CREATED`,
  JOB_COMPLETED = `JOB_COMPLETED`,
  JOB_FAILED = `JOB_FAILED`,
  JOB_NOT_WHITELISTED = `JOB_NOT_WHITELISTED`,
}

interface IBaseJob {
  name: string
  outputDir: string
  args: Record<string, any>
}

interface IJobInput {
  inputPaths: Array<string>
  plugin: {
    name: string
    version: string
    resolve: string
  }
}

interface IInternalJob {
  id: string
  contentDigest: string
  inputPaths: Array<{
    path: string
    contentDigest: string
  }>
  plugin: {
    name: string
    version: string
    resolve: string
    isLocal: boolean
  }
}

export type JobResultInterface = Record<string, unknown>
export type JobInput = IBaseJob & IJobInput
export type InternalJob = IBaseJob & IInternalJob

export class WorkerError extends Error {
  constructor(error: Error | string) {
    if (typeof error === `string`) {
      super(error)
    } else {
      // use error.message or else stringiyf the object so we don't get [Object object]
      super(error.message ?? JSON.stringify(error))
    }

    this.name = `WorkerError`

    Error.captureStackTrace(this, WorkerError)
  }
}

let activityForJobs: IPhantomReporter | null = null
let activeJobs = 0
let isListeningForMessages = false
let hasShownIPCDisabledWarning = false

const jobsInProcess: Map<
  string,
  { id: string; deferred: pDefer.DeferredPromise<Record<string, unknown>> }
> = new Map()
const externalJobsMap: Map<
  string,
  { job: InternalJob; deferred: pDefer.DeferredPromise<any> }
> = new Map()

/**
 * We want to use absolute paths to make sure they are on the filesystem
 */
function convertPathsToAbsolute(filePath: string): string {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`${filePath} should be an absolute path.`)
  }

  return slash(filePath)
}
/**
 * Get contenthash of a file
 */
function createFileHash(path: string): string {
  return hasha.fromFileSync(path, { algorithm: `sha1` })
}

let hasActiveJobs: pDefer.DeferredPromise<void> | null = null

function hasExternalJobsEnabled(): boolean {
  return (
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `true` ||
    process.env.ENABLE_GATSBY_EXTERNAL_JOBS === `1`
  )
}

/**
 * Get the local worker function and execute it on the user's machine
 */
async function runLocalWorker<T>(
  workerFn: { ({ inputPaths, outputDir, args }: InternalJob): T },
  job: InternalJob
): Promise<T> {
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
          } as InternalJob)
        )
      } catch (err) {
        reject(new WorkerError(err))
      }
    })
  })
}

function listenForJobMessages(): void {
  process.on(`message`, msg => {
    if (
      msg &&
      msg.type &&
      msg.payload &&
      msg.payload.id &&
      externalJobsMap.has(msg.payload.id)
    ) {
      const { job, deferred } = externalJobsMap.get(msg.payload.id)!

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

function runExternalWorker(job: InternalJob): Promise<any> {
  const deferred = pDefer<any>()

  externalJobsMap.set(job.id, {
    job,
    deferred,
  })

  process.send!({
    type: MESSAGE_TYPES.JOB_CREATED,
    payload: job,
  })

  return deferred.promise
}

/**
 * Make sure we have everything we need to run a job
 * If we do, run it locally.
 * TODO add external job execution through ipc
 */
function runJob(
  job: InternalJob,
  forceLocal = false
): Promise<Record<string, unknown>> {
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

function isInternalJob(job: JobInput | InternalJob): job is InternalJob {
  return (
    (job as InternalJob).id !== undefined &&
    (job as InternalJob).contentDigest !== undefined
  )
}

/**
 * Create an internal job object
 */
export function createInternalJob(
  job: JobInput | InternalJob,
  plugin: { name: string; version: string; resolve: string }
): InternalJob {
  // It looks like we already have an augmented job so we shouldn't redo this work
  if (isInternalJob(job)) {
    return job
  }

  const { name, inputPaths, outputDir, args } = job

  // TODO see if we can make this async, filehashing might be expensive to wait for
  // currently this needs to be sync as we could miss jobs to have been scheduled and
  // are still processing their hashes
  const inputPathsWithContentDigest = inputPaths.map((pth: string) => {
    return {
      path: convertPathsToAbsolute(pth),
      contentDigest: createFileHash(pth),
    }
  })

  const internalJob: InternalJob = {
    id: uuidv4(),
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
 */
export async function enqueueJob(
  job: InternalJob
): Promise<Record<string, unknown>> {
  // When we already have a job that's executing, return the same promise.
  // we have another check in our createJobV2 action to return jobs that have been done in a previous gatsby run
  if (jobsInProcess.has(job.contentDigest)) {
    console.log(
      `[enqueuejob] reusing in progress job ${
        process.env.JEST_WORKER_ID || `main`
      }`,
      job.contentDigest
    )
    return jobsInProcess.get(job.contentDigest)!.deferred.promise
  }

  if (activeJobs === 0) {
    hasActiveJobs = pDefer<void>()
  }

  // Bump active jobs
  activeJobs++
  if (!activityForJobs) {
    activityForJobs = reporter.phantomActivity(`Running jobs v2`)
    activityForJobs!.start()
  }

  console.log(
    `[enqueuejob] creating new job ${process.env.JEST_WORKER_ID || `main`}`,
    job.contentDigest
  )

  const deferred = pDefer<Record<string, unknown>>()
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
    deferred.reject(new WorkerError(err))
  } finally {
    // when all jobs are done we end the activity
    if (--activeJobs === 0) {
      hasActiveJobs!.resolve()
      activityForJobs!.end()
      // eslint-disable-next-line require-atomic-updates
      activityForJobs = null
    }
  }

  return deferred.promise
}

/**
 * Get in progress job promise
 */
export function getInProcessJobPromise(
  contentDigest: string
): Promise<Record<string, unknown>> | undefined {
  return jobsInProcess.get(contentDigest)?.deferred.promise
}

/**
 * Remove a job from our inProgressQueue to reduce memory usage
 */
export function removeInProgressJob(contentDigest: string): void {
  jobsInProcess.delete(contentDigest)
}

/**
 * Wait for all processing jobs to have finished
 */
export function waitUntilAllJobsComplete(): Promise<void> {
  return hasActiveJobs ? hasActiveJobs.promise : Promise.resolve()
}

export function isJobStale(
  job: Partial<InternalJob> & { inputPaths: InternalJob["inputPaths"] }
): boolean {
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
