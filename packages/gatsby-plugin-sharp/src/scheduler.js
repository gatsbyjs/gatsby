const _ = require(`lodash`)
const uuidv4 = require(`uuid/v4`)
const pDefer = require(`p-defer`)
const worker = require(`./worker`)
const { createProgress } = require(`./utils`)

const toProcess = new Map()
let pendingImagesCounter = 0
let completedImagesCounter = 0

let bar

// node 8 doesn't support promise.finally, we extract this function to re-use it inside then & catch
const cleanupJob = (job, boundActionCreators) => {
  if (bar) {
    bar.tick(job.task.args.operations.length)
  }

  completedImagesCounter += job.task.args.operations.length

  if (completedImagesCounter === pendingImagesCounter) {
    if (bar) {
      bar.done()
      bar = null
    }
    pendingImagesCounter = 0
    completedImagesCounter = 0
  }

  boundActionCreators.endJob({ id: job.id }, { name: `gatsby-plugin-sharp` })
}

const executeJobs = _.throttle(
  boundActionCreators => {
    toProcess.forEach(job => {
      const { task } = job
      toProcess.delete(task.inputPaths[0])

      try {
        worker
          .IMAGE_PROCESSING(task.inputPaths, task.outputDir, task.args)
          .then(() => {
            job.deferred.resolve()
            cleanupJob(job, boundActionCreators)
          })
          .catch(err => {
            job.deferred.reject(err)
            cleanupJob(job, boundActionCreators)
          })
      } catch (err) {
        job.deferred.reject(err)
        cleanupJob(job, boundActionCreators)
      }
    })
  },
  1000,
  { leading: false }
)

const scheduleJob = async (
  job,
  boundActionCreators,
  reporter,
  reportStatus = true,
  pluginOptions
) => {
  const isQueued = toProcess.has(job.inputPath)
  let scheduledPromise

  if (reportStatus && !bar) {
    bar = createProgress(`Generating image thumbnails`, reporter)
    bar.start()
  }

  // if an input image is already queued we add it to a transforms queue
  // doing different manipulations in parallel makes sharp faster.
  if (isQueued) {
    const registeredJob = toProcess.get(job.inputPath)
    // add the transform to the transforms list
    const operations = registeredJob.task.args.operations.concat({
      outputPath: job.outputPath,
      transforms: job.args,
    })

    scheduledPromise = registeredJob.deferred.promise

    toProcess.set(job.inputPath, {
      ...registeredJob,
      task: {
        ...registeredJob.task,
        args: {
          ...registeredJob.task.args,
          operations,
        },
      },
    })

    // update the job
    boundActionCreators.setJob(
      {
        id: registeredJob.id,
        imagesCount: operations.length,
      },
      { name: `gatsby-plugin-sharp` }
    )
  } else {
    const jobId = uuidv4()
    const deferred = pDefer()
    scheduledPromise = deferred.promise

    // make our job compliant with new job spec
    toProcess.set(job.inputPath, {
      id: jobId,
      task: {
        inputPaths: [job.inputPath],
        outputDir: job.outputDir,
        args: {
          contentDigest: job.contentDigest,
          pluginOptions,
          operations: [
            {
              outputPath: job.outputPath,
              transforms: job.args,
            },
          ],
        },
      },
      deferred,
    })

    // create the job so gatsby waits for completion
    boundActionCreators.createJob(
      {
        id: jobId,
        description: `processing image ${job.inputPath}`,
        imagesCount: 1,
      },
      { name: `gatsby-plugin-sharp` }
    )
  }

  pendingImagesCounter++
  if (bar) {
    bar.total = pendingImagesCounter
  }

  executeJobs(boundActionCreators)

  return scheduledPromise
}

export { scheduleJob }
