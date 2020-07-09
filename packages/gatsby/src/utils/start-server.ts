import chokidar from "chokidar"

import webpackHotMiddleware from "webpack-hot-middleware"
import webpackDevMiddleware, {
  WebpackDevMiddleware,
} from "webpack-dev-middleware"
import got from "got"
import webpack from "webpack"
import express from "express"
import graphqlHTTP from "express-graphql"
import graphqlPlayground from "graphql-playground-middleware-express"
import graphiqlExplorer from "gatsby-graphiql-explorer"
import { formatError } from "graphql"

import webpackConfig from "../utils/webpack.config"
import { store } from "../redux"
import { buildHTML } from "../commands/build-html"
import { withBasePath } from "../utils/path"
import report from "gatsby-cli/lib/reporter"
import launchEditor from "react-dev-utils/launchEditor"
import cors from "cors"
import telemetry from "gatsby-telemetry"
import * as WorkerPool from "../utils/worker/pool"
import http from "http"
import https from "https"

import { developStatic } from "../commands/develop-static"
import withResolverContext from "../schema/context"
import { websocketManager, WebsocketManager } from "../utils/websocket-manager"
import { slash } from "gatsby-core-utils"
import apiRunnerNode from "../utils/api-runner-node"
import { Express } from "express"

import { Stage, IProgram } from "../commands/types"
import JestWorker from "jest-worker"

import {
  startSchemaHotReloader,
  stopSchemaHotReloader,
} from "../bootstrap/schema-hot-reloader"

import sourceNodes from "../utils/source-nodes"
import { createSchemaCustomization } from "../utils/create-schema-customization"
import { rebuild as rebuildSchema } from "../schema"
type ActivityTracker = any // TODO: Replace this with proper type once reporter is typed

interface IServer {
  compiler: webpack.Compiler
  listener: http.Server | https.Server
  webpackActivity: ActivityTracker
  websocketManager: WebsocketManager
  workerPool: JestWorker
  webpackWatching: IWebpackWatchingPauseResume
}

interface IWebpackWatchingPauseResume {
  suspend: () => void
  resume: () => void
}

// context seems to be public, but not documented API
// see https://github.com/webpack/webpack-dev-middleware/issues/656
type PatchedWebpackDevMiddleware = WebpackDevMiddleware &
  express.RequestHandler & {
    context: {
      watching: webpack.Watching & IWebpackWatchingPauseResume
    }
  }

export async function startServer(
  program: IProgram,
  app: Express,
  workerPool: JestWorker = WorkerPool.create()
): Promise<IServer> {
  const indexHTMLActivity = report.phantomActivity(`building index.html`, {})
  indexHTMLActivity.start()
  const directory = program.directory
  const directoryPath = withBasePath(directory)
  const createIndexHtml = async (activity: ActivityTracker): Promise<void> => {
    try {
      await buildHTML({
        program,
        stage: Stage.DevelopHTML,
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

        if (!schemaCustomization.composer) {
          throw new Error(
            `A schema composer was not created in time. This is likely a gatsby bug. If you experienced this please create an issue.`
          )
        }
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
   * This will be removed in state machine
   * Refresh external data sources.
   * This behavior is disabled by default, but the ENABLE_GATSBY_REFRESH_ENDPOINT env var enables it
   * If no GATSBY_REFRESH_TOKEN env var is available, then no Authorization header is required
   **/
  const REFRESH_ENDPOINT = `/__refresh`
  const refresh = async (req: express.Request): Promise<void> => {
    stopSchemaHotReloader()
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
    activity = report.activityTimer(`rebuild schema`)
    activity.start()
    await rebuildSchema({ parentSpan: activity })
    activity.end()
    startSchemaHotReloader()
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

  const webpackDevMiddlewareInstance = (webpackDevMiddleware(compiler, {
    logLevel: `silent`,
    publicPath: devConfig.output.publicPath,
    watchOptions: devConfig.devServer ? devConfig.devServer.watchOptions : null,
    stats: `errors-only`,
  }) as unknown) as PatchedWebpackDevMiddleware

  app.use(webpackDevMiddlewareInstance)

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
    }, cors())
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
   **/
  const server = new http.Server(app)

  const socket = websocketManager.init({ server, directory: program.directory })

  // hardcoded `localhost`, because host should match `target` we set
  // in http proxy in `develop-proxy`
  const listener = server.listen(program.port, `localhost`)

  // Register watcher that rebuilds index.html every time html.js changes.
  const watchGlobs = [`src/html.js`, `plugins/**/gatsby-ssr.js`].map(path =>
    slash(directoryPath(path))
  )

  chokidar.watch(watchGlobs).on(`change`, async () => {
    await createIndexHtml(indexHTMLActivity)
    // eslint-disable-next-line no-unused-expressions
    socket?.to(`clients`).emit(`reload`)
  })

  return {
    compiler,
    listener,
    webpackActivity,
    websocketManager,
    workerPool,
    webpackWatching: webpackDevMiddlewareInstance.context.watching,
  }
}
