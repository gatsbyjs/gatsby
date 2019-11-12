/* @flow weak */
const path = require(`path`)
const openurl = require(`better-opn`)
const fs = require(`fs-extra`)
const compression = require(`compression`)
const express = require(`express`)
const chalk = require(`chalk`)
const { match: reachMatch } = require(`@reach/router/lib/utils`)
const onExit = require(`signal-exit`)
const report = require(`gatsby-cli/lib/reporter`)

const telemetry = require(`gatsby-telemetry`)

const detectPortInUseAndPrompt = require(`../utils/detect-port-in-use-and-prompt`)
const getConfigFile = require(`../bootstrap/get-config-file`)
const preferDefault = require(`../bootstrap/prefer-default`)

onExit(() => {
  telemetry.trackCli(`SERVE_STOP`)
})

const readMatchPaths = async program => {
  const filePath = path.join(program.directory, `.cache`, `match-paths.json`)
  let rawJSON = `[]`
  try {
    rawJSON = await fs.readFile(filePath)
  } catch (error) {
    report.warn(error)
    report.warn(
      `Could not read ${chalk.bold(
        `match-paths.json`
      )} from the .cache directory`
    )
    report.warn(
      `Client-side routing will not work correctly. Maybe you need to re-run ${chalk.bold(
        `gatsby build`
      )}?`
    )
  }
  return JSON.parse(rawJSON)
}

const matchPathRouter = (matchPaths, options) => (req, res, next) => {
  const { url } = req
  if (req.accepts(`html`)) {
    const matchPath = matchPaths.find(
      ({ matchPath }) => reachMatch(matchPath, url) !== null
    )
    if (matchPath) {
      return res.sendFile(
        path.join(matchPath.path, `index.html`),
        options,
        err => {
          if (err) {
            next()
          }
        }
      )
    }
  }
  return next()
}

const readRedirects = async program => {
  const filePath = path.join(program.directory, `.cache`, `redirects.json`)
  let rawJSON = `[]`
  try {
    rawJSON = await fs.readFile(filePath)
  } catch (error) {
    report.warn(error)
    report.warn(
      `Could not read ${chalk.bold(`redirects.json`)} from the .cache directory`
    )
  }
  const listOfRedirects = JSON.parse(rawJSON)

  // Return object mapping old -> new
  // e.g. { old: { toPath: 'new', isPermanent: false }}
  return listOfRedirects.reduce(function(result, item, index, array) {
    const { fromPath, toPath, isPermanent } = item
    result[fromPath] = { toPath, isPermanent }
    return result
  }, {})
}

const redirectRouter = (redirects, options) => (req, res, next) => {
  const { url } = req
  const redirect = redirects[url]
  if (!redirect) return next()

  const { toPath, isPermanent } = redirect
  const statusCode = isPermanent ? 301 : 302
  return res.redirect(statusCode, toPath)
}

module.exports = async program => {
  telemetry.trackCli(`SERVE_START`)
  telemetry.startBackgroundUpdate()
  let { prefixPaths, port, open, host } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  const { configModule } = await getConfigFile(
    program.directory,
    `gatsby-config`
  )
  const config = preferDefault(configModule)

  const { pathPrefix: configPathPrefix } = config || {}

  const pathPrefix = prefixPaths && configPathPrefix ? configPathPrefix : `/`

  const root = path.join(program.directory, `public`)

  const app = express()
  const router = express.Router()

  app.use(telemetry.expressMiddleware(`SERVE`))

  router.use(compression())
  router.use(express.static(`public`))

  const matchPaths = await readMatchPaths(program)
  router.use(matchPathRouter(matchPaths, { root }))

  const redirects = await readRedirects(program)
  router.use(redirectRouter(redirects, { root }))

  router.use((req, res, next) => {
    if (req.accepts(`html`)) {
      return res.status(404).sendFile(`404.html`, { root })
    }
    return next()
  })
  app.use(function(req, res, next) {
    res.header(`Access-Control-Allow-Origin`, `*`)
    res.header(
      `Access-Control-Allow-Headers`,
      `Origin, X-Requested-With, Content-Type, Accept`
    )
    next()
  })
  app.use(pathPrefix, router)

  const startListening = () => {
    app.listen(port, host, () => {
      let openUrlString = `http://${host}:${port}${pathPrefix}`
      report.info(`gatsby serve running at: ${chalk.bold(openUrlString)}`)
      if (open) {
        report.info(`Opening browser...`)
        Promise.resolve(openurl(openUrlString)).catch(err =>
          report.warn(`Browser not opened because no browser was found`)
        )
      }
    })
  }

  try {
    port = await detectPortInUseAndPrompt(port)
    startListening()
  } catch (e) {
    if (e.message === `USER_REJECTED`) {
      return
    }

    throw e
  }
}
