const {
  setBoundActionCreators,
  setPluginOptions,
  queue,
  reportError,
} = require(`./index`)
const processFile = require(`./processFile`)
const { scheduleJob } = require(`./scheduler`)

exports.onPreInit = ({ actions, cache }, pluginOptions) => {
  cache.init()

  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
}

// JSON.stringify doesn't work on an Map so we need to convert it to an array
exports.onPostBootstrap = async ({ cache }) =>
  cache.set(`queue`, Array.from(queue))

/**
 * Execute all unprocessed images on gatsby build
 */
exports.onPostBuild = async (
  { cache, boundActionCreators, reporter },
  pluginOptions
) => {
  const rawQueue = await cache.get(`queue`)
  const queue = new Map(rawQueue)

  let promises = []
  for (const [, job] of queue) {
    promises.push(scheduleJob(job, boundActionCreators, pluginOptions))
  }

  return Promise.all(promises).catch(({ err, message }) => {
    reportError(message || err.message, err, reporter)
  })
}

/**
 * Build images on the fly when they are requested by the browser
 */
exports.onCreateDevServer = ({ app, cache }, pluginOptions) => {
  app.use(async (req, res, next) => {
    const rawQueue = await cache.get(`queue`)
    if (!rawQueue) {
      return next()
    }

    const queue = new Map(rawQueue)
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
