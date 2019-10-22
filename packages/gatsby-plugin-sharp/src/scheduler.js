const _ = require(`lodash`)
const { existsSync } = require(`fs`)
const uuidv4 = require(`uuid/v4`)
const worker = require(`./worker`)
const { createProgress } = require(`./utils`)

const toProcess = {}
let totalJobs = 0
let jobsFinished = 0

let bar

const getFileKey = filePath => filePath.replace(/\./g, `%2E`)

const setJobToProcess = (toProcess, job, deferred) => {
  const inputFileKey = getFileKey(job.inputPath)
  const outputFileKey = getFileKey(job.outputPath)
  const jobPath = `["${inputFileKey}"].["${outputFileKey}"]`

  // Check if the job has already been queued. If it has, there's nothing
  // to do, return.
  if (_.has(toProcess, jobPath)) {
    return { existingPromise: _.get(toProcess, `${jobPath}.deferred.promise`) }
  }

  // Check if the output file already exists so we don't redo work.
  if (existsSync(job.outputPath)) {
    return { existingPromise: Promise.resolve(job) }
  }

  let isQueued = false
  if (toProcess[inputFileKey]) {
    isQueued = true
  }

  _.set(toProcess, jobPath, {
    job: job,
    deferred,
  })

  return { isQueued }
}

const scheduleJob = async (
  job,
  boundActionCreators,
  pluginOptions,
  reporter,
  reportStatus = true
) => {
  // deferred naming comes from https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
  let deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  const { existingPromise, isQueued } = setJobToProcess(
    toProcess,
    job,
    deferred
  )
  if (existingPromise) {
    return existingPromise
  }

  if (totalJobs === 0) {
    bar = createProgress(`Generating image thumbnails`, reporter)
    bar.start()
  }
  totalJobs += 1

  if (!isQueued) {
    // Create image job
    const jobId = uuidv4()
    boundActionCreators.createJob(
      {
        id: jobId,
        description: `processing image ${job.inputPath}`,
        imagesCount: 1,
      },
      { name: `gatsby-plugin-sharp` }
    )

    runJobs(
      jobId,
      getFileKey(job.inputPath),
      boundActionCreators,
      pluginOptions,
      jobs => {
        jobsFinished++

        // only show progress on build
        jobs.forEach(() => {
          if (reportStatus) {
            bar.tick()
          }
        })

        if (totalJobs === jobsFinished) {
          bar.done()
          totalJobs = 0
        }
      }
    )
  }

  return deferred.promise
}

function runJobs(jobId, inputFileKey, boundActionCreators, pluginOptions, cb) {
  const jobs = _.values(toProcess[inputFileKey])
  const { job } = jobs[0]

  // Delete the input key from the toProcess list so more jobs can be queued.
  delete toProcess[inputFileKey]

  // Update job info
  boundActionCreators.setJob(
    {
      id: jobId,
      imagesCount: jobs.length,
    },
    { name: `gatsby-plugin-sharp` }
  )

  // We're now processing the file's jobs.
  let imagesFinished = 0

  bar.total = totalJobs

  try {
    worker({
      inputPath: job.inputPath,
      contentDigest: job.contentDigest,
      transforms: jobs.map(child => {
        return {
          outputPath: child.job.outputPath,
          transforms: child.job.args,
        }
      }),
      pluginOptions,
    })
      .then(() => {
        jobs.map(job => {
          job.deferred.resolve()
        })

        imagesFinished += jobs.length

        boundActionCreators.setJob(
          {
            id: jobId,
            imagesFinished,
          },
          { name: `gatsby-plugin-sharp` }
        )
      })
      .catch(() => {})
      .then(() => {
        boundActionCreators.endJob(
          { id: jobId },
          { name: `gatsby-plugin-sharp` }
        )

        cb(jobs)
      })
  } catch (err) {
    jobs.forEach(({ deferred }) => {
      deferred.reject({
        err,
        message: err.message,
      })
    })
  }
}

export { scheduleJob, setJobToProcess }
