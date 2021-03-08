const uuidv4 = require(`uuid/v4`)
const path = require(`path`)
const fs = require(`fs-extra`)
const got = require(`got`)
const { createContentDigest } = require(`gatsby-core-utils`)
const worker = require(`./gatsby-worker`)

const processImages = async (jobId, job, actions) => {
  try {
    await worker.IMAGE_PROCESSING(job)
  } finally {
    actions.endJob({ id: jobId }, { name: `gatsby-plugin-sharp` })
  }
}

const jobsInFlight = new Map()
const scheduleJob = async (job, actions, reporter) => {
  const inputPaths = job.inputPaths.filter(
    inputPath => !fs.existsSync(path.join(job.outputDir, inputPath))
  )

  // all paths exists so we bail
  if (!inputPaths.length) {
    return Promise.resolve()
  }

  const convertedJob = {
    inputPaths: inputPaths.map(inputPath => {
      return {
        path: inputPath,
        // we don't care about the content, we never did so the old api will still have the same flaws
        contentDigest: createContentDigest(inputPath),
      }
    }),
    outputDir: job.outputDir,
    args: job.args,
  }

  const jobDigest = createContentDigest(convertedJob)
  if (jobsInFlight.has(jobDigest)) {
    return jobsInFlight.get(jobDigest)
  }

  if (process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL) {
    const cloudJob = got
      .post(process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL, {
        json: {
          file: job.inputPaths[0],
          hash: createContentDigest(job),
          transforms: job.args.operations,
          options: job.args.pluginOptions,
        },
        responseType: `json`,
      })
      .then(() => {})

    jobsInFlight.set(jobDigest, cloudJob)
    return cloudJob
  }

  // If output file already exists don't re-run image processing
  // this has been in here from the beginning, job api v2 does this correct
  // to not break existing behahaviour we put this in here too.
  job.args.operations = job.args.operations.filter(
    operation => !fs.existsSync(path.join(job.outputDir, operation.outputPath))
  )

  if (!job.args.operations.length) {
    jobsInFlight.set(jobDigest, Promise.resolve())
    return jobsInFlight.get(jobDigest)
  }

  const jobId = uuidv4()
  actions.createJob(
    {
      id: jobId,
      description: `processing image ${job.inputPaths[0]}`,
      imagesCount: job.args.operations.length,
    },
    { name: `gatsby-plugin-sharp` }
  )

  const promise = new Promise((resolve, reject) => {
    setImmediate(() => {
      processImages(jobId, convertedJob, actions).then(result => {
        resolve(result)
      }, reject)
    })
  })

  jobsInFlight.set(jobDigest, promise)

  return promise
}

export { scheduleJob }
