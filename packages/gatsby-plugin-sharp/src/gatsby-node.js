const {
  setBoundActionCreators,
  setPluginOptions,
  queue: jobQueue,
  reportError,
} = require(`./index`)
const { scheduleJob } = require(`./scheduler`)

const getQueueFromCache = store => {
  const pluginStatus = store.getState().status.plugins[`gatsby-plugin-sharp`]

  if (!pluginStatus || !pluginStatus.queue) {
    return new Map()
  }

  return new Map(pluginStatus.queue)
}

const saveQueueToCache = async (store, setPluginStatus, queue) => {
  const cachedQueue = getQueueFromCache(store)

  // merge both queues
  for (const [key, job] of cachedQueue) {
    if (!queue.has(key)) {
      queue.set(key, job)
    }
  }

  // JSON.stringify doesn't work on an Map so we need to convert it to an array
  setPluginStatus({ queue: Array.from(queue) })
}

exports.onPreBootstrap = ({ actions }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
}

/**
 * save queue to the cache
 */
exports.onPostBootstrap = ({ actions: { setPluginStatus }, store }) =>
  saveQueueToCache(store, setPluginStatus, jobQueue)

/**
 * Execute all unprocessed images on gatsby build
 */
let promises = []
exports.onPreBuild = ({ store, boundActionCreators }, pluginOptions) => {
  const cachedQueue = getQueueFromCache(store)

  for (const [, job] of cachedQueue) {
    promises.push(scheduleJob(job, boundActionCreators, pluginOptions))
  }
}

/**
 * wait for all images to be processed
 */
exports.onPostBuild = ({ actions: { setPluginStatus }, store, reporter }) =>
  Promise.all(promises)
    .then(() => setPluginStatus({ queue: [] }))
    .catch(({ err, message }) => {
      reportError(message || err.message, err, reporter)
    })

/**
 * Build images on the fly when they are requested by the browser
 */
exports.onCreateDevServer = async (
  { app, emitter, boundActionCreators, actions: { setPluginStatus }, store },
  pluginOptions
) => {
  emitter.on(`QUERY_QUEUE_DRAINED`, () =>
    saveQueueToCache(store, setPluginStatus, jobQueue)
  )

  app.use(async (req, res, next) => {
    const queue = getQueueFromCache(store)
    if (!queue.has(req.originalUrl)) {
      return next()
    }

    const job = queue.get(req.originalUrl)

    // wait until the file has been processed and saved to disk
    await scheduleJob(job, boundActionCreators, pluginOptions, false)
    // remove job from queue because it has been processed
    queue.delete(req.originalUrl)

    saveQueueToCache(store, setPluginStatus, queue)

    return res.sendFile(job.outputPath)
  })
}

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
