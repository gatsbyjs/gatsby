const { setBoundActionCreators, setPluginOptions } = require(`./index`)
const cache = require(`./cache`)
const processFile = require(`./processFile`)

exports.onPreInit = ({ actions }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
}

exports.onCreateDevServer = ({ app }) => {
  app.use((req, res, next) => {
    if (cache.has(req.originalUrl)) {
      const { job, pluginOptions } = cache.get(req.originalUrl)
      return Promise.all(
        processFile(job.file.absolutePath, [job], pluginOptions)
      ).then(() => {
        res.sendFile(job.outputPath)
      })
    }

    return next()
  })
}

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
