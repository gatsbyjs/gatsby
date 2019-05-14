/* @flow weak */
const path = require(`path`)
const openurl = require(`better-opn`)
const fs = require(`fs-extra`)
const compression = require(`compression`)
const express = require(`express`)
const chalk = require(`chalk`)
const { match: reachMatch } = require(`@reach/router/lib/utils`)
const rl = require(`readline`)
const onExit = require(`signal-exit`)

const telemetry = require(`gatsby-telemetry`)

const detectPortInUseAndPrompt = require(`../utils/detect-port-in-use-and-prompt`)
const getConfigFile = require(`../bootstrap/get-config-file`)
const preferDefault = require(`../bootstrap/prefer-default`)

const rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Quit immediately on hearing ctrl-c
rlInterface.on(`SIGINT`, () => {
  process.exit()
})

onExit(() => {
  telemetry.trackCli(`SERVE_STOP`)
})

const getPages = directory =>
  fs
    .readFile(path.join(directory, `.cache`, `pages.json`))
    .then(contents => JSON.parse(contents))
    .catch(() => [])

const clientOnlyPathsRouter = (pages, options) => {
  const clientOnlyRoutes = pages.filter(page => page.matchPath)
  return (req, res, next) => {
    const { url } = req
    if (req.accepts(`html`)) {
      const route = clientOnlyRoutes.find(
        clientRoute => reachMatch(clientRoute.matchPath, url) !== null
      )
      if (route && route.path) {
        return res.sendFile(
          path.join(route.path, `index.html`),
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
}

module.exports = async program => {
  telemetry.trackCli(`SERVE_START`)
  telemetry.startBackgroundUpdate()
  let { prefixPaths, port, open, host } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  const config = await preferDefault(
    getConfigFile(program.directory, `gatsby-config`)
  )

  const { pathPrefix: configPathPrefix } = config || {}

  const pathPrefix = prefixPaths && configPathPrefix ? configPathPrefix : `/`

  const root = path.join(program.directory, `public`)
  const pages = await getPages(program.directory)

  const app = express()
  const router = express.Router()

  app.use(telemetry.expressMiddleware(`SERVE`))

  router.use(compression())
  router.use(express.static(`public`))
  router.use(clientOnlyPathsRouter(pages, { root }))
  router.use((req, res, next) => {
    if (req.accepts(`html`)) {
      return res.status(404).sendFile(`404.html`, { root })
    }
    return next()
  })
  app.use(function(req, res, next) {
    res.header(`Access-Control-Allow-Origin`, `http://${host}:${port}`)
    res.header(`Access-Control-Allow-Credentials`, true)
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
      console.log(
        `${chalk.blue(`info`)} gatsby serve running at: ${chalk.bold(
          openUrlString
        )}`
      )
      if (open) {
        console.log(`${chalk.blue(`info`)} Opening browser...`)
        Promise.resolve(openurl(openUrlString)).catch(err =>
          console.log(
            `${chalk.yellow(
              `warn`
            )} Browser not opened because no browser was found`
          )
        )
      }
    })
  }

  port = await detectPortInUseAndPrompt(port, rlInterface)
  startListening()
}
