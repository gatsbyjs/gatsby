exports.onPreInit = ({ actions, reporter }, pluginOptions) => {
  try {
    require(`sharp`)
  } catch (error) {
    // Bail early if sharp isn't working
    // TODO: Add link to docs
    reporter.panic(
      `
      "sharp" doesn't seem to have been built or installed correctly
      `
    )
  }

  const { setBoundActionCreators, setPluginOptions } = require(`./index`)

  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
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
