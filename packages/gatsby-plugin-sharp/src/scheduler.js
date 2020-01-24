const uuidv4 = require(`uuid/v4`)
const path = require(`path`)
const fs = require(`fs-extra`)
const got = require(`got`)
const { createContentDigest } = require(`gatsby-core-utils`)
const worker = require(`./gatsby-worker`)
const { createOrGetProgressBar } = require(`./utils`)

const processImages = async (jobId, job, boundActionCreators) => {
  try {
    await worker.IMAGE_PROCESSING(job)
  } catch (err) {
    throw err
  } finally {
    boundActionCreators.endJob({ id: jobId }, { name: `gatsby-plugin-sharp` })
  }
}

const jobsInFlight = new Map()
const scheduleJob = async (job, boundActionCreators, reporter) => {
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
        body: {
          file: job.inputPaths[0],
          hash: createContentDigest(job),
          transforms: job.args.operations,
          options: job.args.pluginOptions,
        },
        json: true,
      })
      .then(() => {})

    jobsInFlight.set(jobDigest, cloudJob)
    return cloudJob
  }

  const jobId = uuidv4()
  boundActionCreators.createJob(
    {
      id: jobId,
      description: `processing image ${job.inputPaths[0]}`,
      imagesCount: job.args.operations.length,
    },
    { name: `gatsby-plugin-sharp` }
  )

  const progressBar = createOrGetProgressBar(reporter)
  const transformsCount = job.args.operations.length
  progressBar.addImageToProcess(transformsCount)

  const promise = new Promise((resolve, reject) => {
    setImmediate(() => {
      processImages(jobId, convertedJob, boundActionCreators).then(result => {
        progressBar.tick(transformsCount)
        resolve(result)
      }, reject)
    })
  })

  jobsInFlight.set(jobDigest, promise)

  return promise
}

export { scheduleJob }
