import url from "url"
import fs from "fs"
import openurl from "better-opn"
import chokidar from "chokidar"

import webpackHotMiddleware from "webpack-hot-middleware"
import webpackDevMiddleware from "webpack-dev-middleware"
import glob from "glob"
import express from "express"
import got from "got"
import webpack from "webpack"
import graphqlHTTP from "express-graphql"
import graphqlPlayground from "graphql-playground-middleware-express"
import graphiqlExplorer from "gatsby-graphiql-explorer"
import { formatError } from "graphql"

import webpackConfig from "../utils/webpack.config"
import bootstrap from "../bootstrap"
import { store } from "../redux"
import { syncStaticDir } from "../utils/get-static-dir"
import { buildHTML } from "./build-html"
import { withBasePath } from "../utils/path"
import report from "gatsby-cli/lib/reporter"
import launchEditor from "react-dev-utils/launchEditor"
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages"
import chalk from "chalk"
import address from "address"
import cors from "cors"
import telemetry from "gatsby-telemetry"
import * as WorkerPool from "../utils/worker/pool"
import http from "http"
import https from "https"

import bootstrapSchemaHotReloader from "../bootstrap/schema-hot-reloader"
import bootstrapPageHotReloader from "../bootstrap/page-hot-reloader"
import { developStatic } from "./develop-static"
import withResolverContext from "../schema/context"
import sourceNodes from "../utils/source-nodes"
import createSchemaCustomization from "../utils/create-schema-customization"
import websocketManager from "../utils/websocket-manager"
import getSslCert from "../utils/get-ssl-cert"
import { slash } from "gatsby-core-utils"
import { initTracer } from "../utils/tracer"
import apiRunnerNode from "../utils/api-runner-node"
import db from "../db"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import onExit from "signal-exit"
import queryUtil from "../query"
import queryWatcher from "../query/query-watcher"
import requiresWriter from "../bootstrap/requires-writer"
import {
  reportWebpackWarnings,
  structureWebpackErrors,
} from "../utils/webpack-error-utils"
import { waitUntilAllJobsComplete } from "../utils/commands/jobs-manager"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"

import { BuildHTMLStage, IProgram } from "./types"

// checks if a string is a valid ip
const REGEX_IP = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/

// const isInteractive = process.stdout.isTTY

// Watch the static directory and copy files to public as they're added or
// changed. Wait 10 seconds so copying doesn't interfere with the regular
// bootstrap.
setTimeout(() => {
  syncStaticDir()
}, 10000)

onExit(() => {
  telemetry.trackCli(`DEVELOP_STOP`)
})

type ActivityTracker = any // TODO: Replace this with proper type once reporter is typed

interface IServer {
  compiler: webpack.Compiler
  listener: http.Server | https.Server
  webpackActivity: ActivityTracker
}

async function startServer(program: IProgram): Promise<IServer> {
  const indexHTMLActivity = report.phantomActivity(`building index.html`, {})
  indexHTMLActivity.start()
  const directory = program.directory
  const directoryPath = withBasePath(directory)
  const workerPool = WorkerPool.create()
  const createIndexHtml = async (activity: ActivityTracker): Promise<void> => {
    try {
      await buildHTML({
        program,
        stage: BuildHTMLStage.DevelopHTML,
        pagePaths: [`/`],
        workerPool,
        activity,
      })
    } catch (err) {
      if (err.name !== `WebpackError`) {
        report.panic(err)
        return
      }
      report.panic(
        report.stripIndent`
          There was an error compiling the html.js component for the development server.

          See our docs page on debugging HTML builds for help https://gatsby.dev/debug-html
        `,
        err
      )
    }
  }

  await createIndexHtml(indexHTMLActivity)

  indexHTMLActivity.end()

  // report.stateUpdate(`webpack`, `IN_PROGRESS`)

  const webpackActivity = report.activityTimer(`Building development bundle`, {
    id: `webpack-develop`,
  })
  webpackActivity.start()

  const devConfig = await webpackConfig(
    program,
    directory,
    `develop`,
    program.port,
    { parentSpan: webpackActivity.span }
  )

  const compiler = webpack(devConfig)

  /**
   * Set up the express app.
   **/
  const app = express()
  app.use(telemetry.expressMiddleware(`DEVELOP`))
  app.use(
    webpackHotMiddleware(compiler, {
      log: false,
      path: `/__webpack_hmr`,
      heartbeat: 10 * 1000,
    })
  )

  app.use(cors())

  /**
   * Pattern matching all endpoints with graphql or graphiql with 1 or more leading underscores
   */
  const graphqlEndpoint = `/_+graphi?ql`

  if (process.env.GATSBY_GRAPHQL_IDE === `playground`) {
    app.get(
      graphqlEndpoint,
      graphqlPlayground({
        endpoint: `/___graphql`,
      }),
      () => {}
    )
  } else {
    graphiqlExplorer(app, {
      graphqlEndpoint,
    })
  }

  app.use(
    graphqlEndpoint,
    graphqlHTTP(
      (): graphqlHTTP.OptionsData => {
        const { schema, schemaCustomization } = store.getState()

        return {
          schema,
          graphiql: false,
          context: withResolverContext({
            schema,
            schemaComposer: schemaCustomization.composer,
            context: {},
            customContext: schemaCustomization.context,
          }),
          customFormatErrorFn(err): unknown {
            return {
              ...formatError(err),
              stack: err.stack ? err.stack.split(`\n`) : [],
            }
          },
        }
      }
    )
  )

  /**
   * Refresh external data sources.
   * This behavior is disabled by default, but the ENABLE_REFRESH_ENDPOINT env var enables it
   * If no GATSBY_REFRESH_TOKEN env var is available, then no Authorization header is required
   **/
  const REFRESH_ENDPOINT = `/__refresh`
  const refresh = async (req: express.Request): Promise<void> => {
    let activity = report.activityTimer(`createSchemaCustomization`, {})
    activity.start()
    await createSchemaCustomization({
      refresh: true,
    })
    activity.end()
    activity = report.activityTimer(`Refreshing source data`, {})
    activity.start()
    await sourceNodes({
      webhookBody: req.body,
    })
    activity.end()
  }
  app.use(REFRESH_ENDPOINT, express.json())
  app.post(REFRESH_ENDPOINT, (req, res) => {
    const enableRefresh = process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
    const refreshToken = process.env.GATSBY_REFRESH_TOKEN
    const authorizedRefresh =
      !refreshToken || req.headers.authorization === refreshToken

    if (enableRefresh && authorizedRefresh) {
      refresh(req)
    }
    res.end()
  })

  app.get(`/__open-stack-frame-in-editor`, (req, res) => {
    launchEditor(req.query.fileName, req.query.lineNumber)
    res.end()
  })

  // Disable directory indexing i.e. serving index.html from a directory.
  // This can lead to serving stale html files during development.
  //
  // We serve by default an empty index.html that sets up the dev environment.
  app.use(developStatic(`public`, { index: false }))

  app.use(
    webpackDevMiddleware(compiler, {
      logLevel: `silent`,
      publicPath: devConfig.output.publicPath,
      watchOptions: devConfig.devServer
        ? devConfig.devServer.watchOptions
        : null,
      stats: `errors-only`,
    })
  )

  // Expose access to app for advanced use cases
  const { developMiddleware } = store.getState().config

  if (developMiddleware) {
    developMiddleware(app, program)
  }

  // Set up API proxy.
  const { proxy } = store.getState().config
  if (proxy) {
    proxy.forEach(({ prefix, url }) => {
      app.use(`${prefix}/*`, (req, res) => {
        const proxiedUrl = url + req.originalUrl
        const {
          // remove `host` from copied headers
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          headers: { host, ...headers },
          method,
        } = req
        req
          .pipe(
            got
              .stream(proxiedUrl, { headers, method, decompress: false })
              .on(`response`, response =>
                res.writeHead(response.statusCode || 200, response.headers)
              )
              .on(`error`, (err, _, response) => {
                if (response) {
                  res.writeHead(response.statusCode || 400, response.headers)
                } else {
                  const message = `Error when trying to proxy request "${req.originalUrl}" to "${proxiedUrl}"`

                  report.error(message, err)
                  res.sendStatus(500)
                }
              })
          )
          .pipe(res)
      })
    })
  }

  await apiRunnerNode(`onCreateDevServer`, { app })

  // In case nothing before handled hot-update - send 404.
  // This fixes "Unexpected token < in JSON at position 0" runtime
  // errors after restarting development server and
  // cause automatic hard refresh in the browser.
  app.use(/.*\.hot-update\.json$/i, (_, res) => {
    res.status(404).end()
  })

  // Render an HTML page and serve it.
  app.use((_, res) => {
    res.sendFile(directoryPath(`public/index.html`), err => {
      if (err) {
        res.status(500).end()
      }
    })
  })

  /**
   * Set up the HTTP server and socket.io.
   * If a SSL cert exists in program, use it with `createServer`.
   **/
  const server = program.ssl
    ? https.createServer(program.ssl, app)
    : new http.Server(app)

  websocketManager.init({ server, directory: program.directory })
  const socket = websocketManager.getSocket()

  const listener = server.listen(program.port, program.host)

  // Register watcher that rebuilds index.html every time html.js changes.
  const watchGlobs = [`src/html.js`, `plugins/**/gatsby-ssr.js`].map(path =>
    slash(directoryPath(path))
  )

  chokidar.watch(watchGlobs).on(`change`, async () => {
    await createIndexHtml(indexHTMLActivity)
    socket.to(`clients`).emit(`reload`)
  })

  return { compiler, listener, webpackActivity }
}

module.exports = async (program: IProgram): Promise<void> => {
  // We want to prompt the feedback request when users quit develop
  // assuming they pass the heuristic check to know they are a user
  // we want to request feedback from, and we're not annoying them.
  process.on(
    `SIGINT`,
    async (): Promise<void> => {
      if (await userPassesFeedbackRequestHeuristic()) {
        showFeedbackRequest()
      }
      process.exit(0)
    }
  )

  if (process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES) {
    report.panic(
      `The flag ${chalk.yellow(
        `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES`
      )} is not available with ${chalk.cyan(
        `gatsby develop`
      )}, please retry using ${chalk.cyan(`gatsby build`)}`
    )
  }
  initTracer(program.openTracingConfigFile)
  report.pendingActivity({ id: `webpack-develop` })
  telemetry.trackCli(`DEVELOP_START`)
  telemetry.startBackgroundUpdate()

  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port

  // In order to enable custom ssl, --cert-file --key-file and -https flags must all be
  // used together
  if ((program[`cert-file`] || program[`key-file`]) && !program.https) {
    report.panic(
      `for custom ssl --https, --cert-file, and --key-file must be used together`
    )
  }

  try {
    program.port = await detectPortInUseAndPrompt(port)
  } catch (e) {
    if (e.message === `USER_REJECTED`) {
      process.exit(0)
    }

    throw e
  }

  // Check if https is enabled, then create or get SSL cert.
  // Certs are named 'devcert' and issued to the host.
  if (program.https) {
    const sslHost =
      program.host === `0.0.0.0` || program.host === `::`
        ? `localhost`
        : program.host

    if (REGEX_IP.test(sslHost)) {
      report.panic(
        `You're trying to generate a ssl certificate for an IP (${sslHost}). Please use a hostname instead.`
      )
    }

    program.ssl = await getSslCert({
      name: sslHost,
      certFile: program[`cert-file`],
      keyFile: program[`key-file`],
      directory: program.directory,
    })
  }

  // Start bootstrap process.
  const { graphqlRunner } = await bootstrap(program)

  // Start the createPages hot reloader.
  bootstrapPageHotReloader(graphqlRunner)

  // Start the schema hot reloader.
  bootstrapSchemaHotReloader()

  await queryUtil.initialProcessQueries()

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )
  await db.saveState()

  await waitUntilAllJobsComplete()
  requiresWriter.startListener()
  db.startAutosave()
  queryUtil.startListeningToDevelopQueue()
  queryWatcher.startWatchDeletePage()

  let { compiler, webpackActivity } = await startServer(program)

  interface IPreparedUrls {
    lanUrlForConfig: string
    lanUrlForTerminal: string
    localUrlForTerminal: string
    localUrlForBrowser: string
  }

  function prepareUrls(
    protocol: `http` | `https`,
    host: string,
    port: number
  ): IPreparedUrls {
    const formatUrl = (hostname: string): string =>
      url.format({
        protocol,
        hostname,
        port,
        pathname: `/`,
      })
    const prettyPrintUrl = (hostname: string): string =>
      url.format({
        protocol,
        hostname,
        port: chalk.bold(String(port)),
        pathname: `/`,
      })

    const isUnspecifiedHost = host === `0.0.0.0` || host === `::`
    let prettyHost = host
    let lanUrlForConfig
    let lanUrlForTerminal
    if (isUnspecifiedHost) {
      prettyHost = `localhost`

      try {
        // This can only return an IPv4 address
        lanUrlForConfig = address.ip()
        if (lanUrlForConfig) {
          // Check if the address is a private ip
          // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
          if (
            /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
              lanUrlForConfig
            )
          ) {
            // Address is private, format it for later use
            lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig)
          } else {
            // Address is not private, so we will discard it
            lanUrlForConfig = undefined
          }
        }
      } catch (_e) {
        // ignored
      }
    }
    // TODO collect errors (GraphQL + Webpack) in Redux so we
    // can clear terminal and print them out on every compile.
    // Borrow pretty printing code from webpack plugin.
    const localUrlForTerminal = prettyPrintUrl(prettyHost)
    const localUrlForBrowser = formatUrl(prettyHost)
    return {
      lanUrlForConfig,
      lanUrlForTerminal,
      localUrlForTerminal,
      localUrlForBrowser,
    }
  }

  function printInstructions(appName: string, urls: IPreparedUrls): void {
    console.log()
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`)
    console.log()

    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold(`Local:`)}            ${urls.localUrlForTerminal}`
      )
      console.log(
        `  ${chalk.bold(`On Your Network:`)}  ${urls.lanUrlForTerminal}`
      )
    } else {
      console.log(`  ${urls.localUrlForTerminal}`)
    }

    console.log()
    console.log(
      `View ${
        process.env.GATSBY_GRAPHQL_IDE === `playground`
          ? `the GraphQL Playground`
          : `GraphiQL`
      }, an in-browser IDE, to explore your site's data and schema`
    )
    console.log()

    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold(`Local:`)}            ${
          urls.localUrlForTerminal
        }___graphql`
      )
      console.log(
        `  ${chalk.bold(`On Your Network:`)}  ${
          urls.lanUrlForTerminal
        }___graphql`
      )
    } else {
      console.log(`  ${urls.localUrlForTerminal}___graphql`)
    }

    console.log()
    console.log(`Note that the development build is not optimized.`)
    console.log(
      `To create a production build, use ` + `${chalk.cyan(`gatsby build`)}`
    )
    console.log()
  }

  function printDeprecationWarnings(): void {
    type DeprecatedAPIList = ["boundActionCreators", "pathContext"] // eslint-disable-line
    const deprecatedApis: DeprecatedAPIList = [
      `boundActionCreators`,
      `pathContext`,
    ]
    const fixMap = {
      boundActionCreators: {
        newName: `actions`,
        docsLink: `https://gatsby.dev/boundActionCreators`,
      },
      pathContext: {
        newName: `pageContext`,
        docsLink: `https://gatsby.dev/pathContext`,
      },
    }
    const deprecatedLocations = {
      boundActionCreators: [] as string[],
      pathContext: [] as string[],
    }

    glob
      .sync(`{,!(node_modules|public)/**/}*.js`, { nodir: true })
      .forEach(file => {
        const fileText = fs.readFileSync(file)
        const matchingApis = deprecatedApis.filter(api =>
          fileText.includes(api)
        )
        matchingApis.forEach(api => deprecatedLocations[api].push(file))
      })

    deprecatedApis.forEach(api => {
      if (deprecatedLocations[api].length) {
        console.log(
          `%s %s %s %s`,
          chalk.cyan(api),
          chalk.yellow(`is deprecated. Please use`),
          chalk.cyan(fixMap[api].newName),
          chalk.yellow(
            `instead. For migration instructions, see ${fixMap[api].docsLink}\nCheck the following files:`
          )
        )
        console.log()
        deprecatedLocations[api].forEach(file => console.log(file))
        console.log()
      }
    })
  }

  // compiler.hooks.invalid.tap(`log compiling`, function(...args) {
  //   console.log(`set invalid`, args, this)
  // })

  compiler.hooks.watchRun.tapAsync(`log compiling`, function(_, done) {
    if (webpackActivity) {
      webpackActivity.end()
    }
    webpackActivity = report.activityTimer(`Re-building development bundle`, {
      id: `webpack-develop`,
    })
    webpackActivity.start()

    done()
  })

  let isFirstCompile = true
  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tapAsync(`print gatsby instructions`, function(
    stats,
    done
  ) {
    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const urls = prepareUrls(
      program.ssl ? `https` : `http`,
      program.host,
      program.port
    )
    const isSuccessful = !messages.errors.length

    if (isSuccessful && isFirstCompile) {
      printInstructions(
        program.sitePackageJson.name || `(Unnamed package)`,
        urls
      )
      printDeprecationWarnings()
      if (program.open) {
        Promise.resolve(openurl(urls.localUrlForBrowser)).catch(() =>
          console.log(
            `${chalk.yellow(
              `warn`
            )} Browser not opened because no browser was found`
          )
        )
      }
    }

    isFirstCompile = false

    if (webpackActivity) {
      reportWebpackWarnings(stats)

      if (!isSuccessful) {
        const errors = structureWebpackErrors(
          `develop`,
          stats.compilation.errors
        )
        webpackActivity.panicOnBuild(errors)
      }
      webpackActivity.end()
      webpackActivity = null
    }

    done()
  })
}
