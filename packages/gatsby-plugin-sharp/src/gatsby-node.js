const {
  setBoundActionCreators,
  setPluginOptions,
  queue,
  reportError,
} = require(`./index`)
const processFile = require(`./processFile`)
const { scheduleJob } = require(`./scheduler`)

const getQueueFromCache = async cache => {
  const rawQueue = await cache.get(`queue`)

  if (!rawQueue) {
    return new Map()
  }

  return new Map(rawQueue)
}

exports.onPreInit = async ({ actions }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
}

/**
 * save queue to the cache
 */
exports.onPostBootstrap = async ({ cache }) => {
  const cachedQueue = await getQueueFromCache(cache)

  // merge both queues
  for (const [key, job] of cachedQueue) {
    queue.set(key, job)
  }

  // JSON.stringify doesn't work on an Map so we need to convert it to an array
  return cache.set(`queue`, Array.from(queue))
}

/**
 * Execute all unprocessed images on gatsby build
 */
let promises = []
exports.onPreBuild = async ({ cache, boundActionCreators }, pluginOptions) => {
  const cachedQueue = await getQueueFromCache(cache)

  let promises = []
  for (const [, job] of cachedQueue) {
    promises.push(scheduleJob(job, boundActionCreators, pluginOptions))
  }
}

/**
 * wait for all images to be processed
 */
exports.onPostBuild = ({ cache, reporter }) =>
  Promise.all(promises)
    .then(() => cache.set(`queue`, []))
    .catch(({ err, message }) => {
      reportError(message || err.message, err, reporter)
    })

/**
 * Build images on the fly when they are requested by the browser
 */
exports.onCreateDevServer = ({ app, cache }, pluginOptions) => {
  app.use(async (req, res, next) => {
    const queue = await getQueueFromCache(cache)
    if (!queue.has(req.originalUrl)) {
      return next()
    }

    const job = queue.get(req.originalUrl)

    // wait until the file has been processed and saved to disk
    await Promise.all(processFile(job.file.absolutePath, [job], pluginOptions))

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
