const {
  setBoundActionCreators,
  // queue: jobQueue,
  // reportError,
} = require(`./index`)
const { getProgressBar, createOrGetProgressBar } = require(`./utils`)

const { setPluginOptions } = require(`./plugin-options`)

// const { scheduleJob } = require(`./scheduler`)
// let normalizedOptions = {}

// const getQueueFromCache = store => {
//   const pluginStatus = store.getState().status.plugins[`gatsby-plugin-sharp`]

//   if (!pluginStatus || !pluginStatus.queue) {
//     return new Map()
//   }

//   return new Map(pluginStatus.queue)
// }

// const saveQueueToCache = async (store, setPluginStatus, queue) => {
//   const cachedQueue = getQueueFromCache(store)

//   // merge both queues
//   for (const [key, job] of cachedQueue) {
//     if (!queue.has(key)) {
//       queue.set(key, job)
//     }
//   }

//   // JSON.stringify doesn't work on an Map so we need to convert it to an array
//   setPluginStatus({ queue: Array.from(queue) })
// }

// const processQueue = (store, boundActionCreators, options) => {
//   const cachedQueue = getQueueFromCache(store)

//   const promises = []
//   for (const [, job] of cachedQueue) {
//     promises.push(scheduleJob(job, boundActionCreators, options))
//   }

//   return promises
// }

// const cleanupQueueAfterProcess = (imageJobs, setPluginStatus, reporter) =>
//   Promise.all(imageJobs)
//     .then(() => setPluginStatus({ queue: [] }))
//     .catch(({ err, message }) => {
//       reportError(message || err.message, err, reporter)
//     })

// create the progressbar once and it will be killed in another lifecycle
const finishProgressBar = () => {
  const progressBar = getProgressBar()
  if (progressBar) {
    progressBar.done()
  }
}

exports.onPostBuild = () => finishProgressBar()
exports.onCreateDevServer = () => finishProgressBar()

exports.onPreBootstrap = ({ actions, emitter, reporter }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)

  // below is a hack / hot fix for confusing progress bar behaviour
  // that doesn't recognize duplicate jobs, as it's now
  // in gatsby core internals (if `createJobV2` is available)
  // we should remove this or make this code path not hit
  // (we should never use emitter in plugins)
  // as soon as possible (possibly by moving progress bar handling
  // inside jobs-manager in core)

  if (emitter) {
    // track how many image transformation each job has
    // END_JOB_V2 doesn't contain that information
    // so we store it in <JobContentHash, TransformsCount> map
    // when job is created. Then retrieve that when job finishes
    // and remove that entry from the map.
    const imageCountInJobsMap = new Map()

    emitter.on(`CREATE_JOB_V2`, action => {
      if (action.plugin.name === `gatsby-plugin-sharp`) {
        const job = action.payload.job
        const imageCount = job.args.operations.length
        imageCountInJobsMap.set(job.contentDigest, imageCount)
        const progress = createOrGetProgressBar(reporter)
        progress.addImageToProcess(imageCount)
      }
    })

    emitter.on(`END_JOB_V2`, action => {
      if (action.plugin.name === `gatsby-plugin-sharp`) {
        const jobContentDigest = action.payload.jobContentDigest
        const imageCount = imageCountInJobsMap.get(jobContentDigest)
        const progress = createOrGetProgressBar(reporter)
        progress.tick(imageCount)
        imageCountInJobsMap.delete(jobContentDigest)
      }
    })
  }

  // normalizedOptions = setPluginOptions(pluginOptions)
}

// /**
//  * save queue to the cache or process queue
//  */
// exports.onPostBootstrap = ({
//   // store,
//   boundActionCreators,
//   // actions: { setPluginStatus },
//   // reporter,
// }) => {
//   const promises = []
//   for (const [, job] of jobQueue) {
//     promises.push(scheduleJob(job, boundActionCreators, normalizedOptions))
//   }

//   return promises
//   // // Save queue
//   // saveQueueToCache(store, setPluginStatus, jobQueue)

//   // if (normalizedOptions.lazyImageGeneration) {
//   //   return
//   // }

//   // const imageJobs = processQueue(store, boundActionCreators, normalizedOptions)

//   // cleanupQueueAfterProcess(imageJobs, setPluginStatus, reporter)

//   // return
// }

/**
 * Execute all unprocessed images on gatsby build
 */
// let promises = []
// exports.onPreBuild = ({ store, boundActionCreators }) => {
//   promises = processQueue(store, boundActionCreators, normalizedOptions)
// }

/**
 * wait for all images to be processed
//  */
// exports.onPostBuild = ({ actions: { setPluginStatus }, reporter }) =>
//   cleanupQueueAfterProcess(promises, setPluginStatus, reporter)

/**
 * Build images on the fly when they are requested by the browser
 */
// exports.onCreateDevServer = async ({
//   app,
//   emitter,
//   boundActionCreators,
//   actions: { setPluginStatus },
//   store,
// }) => {
//   // no need to do set things up when people opt out
//   if (!normalizedOptions.lazyImageGeneration) {
//     return
//   }

//   emitter.on(`QUERY_QUEUE_DRAINED`, () =>
//     saveQueueToCache(store, setPluginStatus, jobQueue)
//   )

//   app.use(async (req, res, next) => {
//     const queue = getQueueFromCache(store)
//     if (!queue.has(req.originalUrl)) {
//       return next()
//     }

//     const job = queue.get(req.originalUrl)

//     // wait until the file has been processed and saved to disk
//     await scheduleJob(job, boundActionCreators, normalizedOptions, false)
//     // remove job from queue because it has been processed
//     queue.delete(req.originalUrl)

//     saveQueueToCache(store, setPluginStatus, queue)

//     return res.sendFile(job.outputPath)
//   })
// }

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
