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
import { buildHTML } from "../commands/build-html"
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
import { developStatic } from "../commands/develop-static"
import withResolverContext from "../schema/context"
import sourceNodes from "../utils/source-nodes"
import { createSchemaCustomization } from "../utils/create-schema-customization"
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
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"

import { BuildHTMLStage, IProgram } from "../commands/types"

import { developMachine } from "../state-machines/develop"
import { interpret } from "xstate"

import { printDeprecationWarnings } from "../utils/print-deprecation-warnings"
import { printInstructions } from "../utils/print-instructions"
import { prepareUrls } from "../utils/prepare-urls"
// import { startServer } from "../utils/start-server"

// checks if a string is a valid ip
const REGEX_IP = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/

type ActivityTracker = any // TODO: Replace this with proper type once reporter is typed

interface IServer {
  compiler: webpack.Compiler
  listener: http.Server | https.Server
  webpackActivity: ActivityTracker
}

export async function startServer(program: IProgram): Promise<IServer> {
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
