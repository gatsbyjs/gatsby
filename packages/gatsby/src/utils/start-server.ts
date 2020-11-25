import webpackHotMiddleware from "webpack-hot-middleware"
import webpackDevMiddleware, {
  WebpackDevMiddleware,
} from "webpack-dev-middleware"
import got from "got"
import webpack from "webpack"
import express from "express"
import compression from "compression"
import graphqlHTTP from "express-graphql"
import graphqlPlayground from "graphql-playground-middleware-express"
import graphiqlExplorer from "gatsby-graphiql-explorer"
import { formatError } from "graphql"
import http from "http"
import https from "https"
import cors from "cors"
import telemetry from "gatsby-telemetry"
import launchEditor from "react-dev-utils/launchEditor"

import { withBasePath } from "../utils/path"
import webpackConfig from "../utils/webpack.config"
import { store, emitter } from "../redux"
import report from "gatsby-cli/lib/reporter"
import * as WorkerPool from "../utils/worker/pool"

import { developStatic } from "../commands/develop-static"
import withResolverContext from "../schema/context"
import { websocketManager, WebsocketManager } from "../utils/websocket-manager"
import {
  reverseFixedPagePath,
  readPageData,
  IPageDataWithQueryResult,
} from "./page-data"
import { getPageData as getPageDataExperimental } from "./get-page-data"
import { findPageByPath } from "./find-page-by-path"
import apiRunnerNode from "../utils/api-runner-node"
import { Express } from "express"
import * as path from "path"

import { Stage, IProgram } from "../commands/types"
import JestWorker from "jest-worker"

type ActivityTracker = any // TODO: Replace this with proper type once reporter is typed

interface IServer {
  compiler: webpack.Compiler
  listener: http.Server | https.Server
  webpackActivity: ActivityTracker
  websocketManager: WebsocketManager
  workerPool: JestWorker
  webpackWatching: IWebpackWatchingPauseResume
}

export interface IWebpackWatchingPauseResume extends webpack.Watching {
  suspend: () => void
  resume: () => void
}

// context seems to be public, but not documented API
// see https://github.com/webpack/webpack-dev-middleware/issues/656
type PatchedWebpackDevMiddleware = WebpackDevMiddleware &
  express.RequestHandler & {
    context: {
      watching: IWebpackWatchingPauseResume
    }
  }

export async function startServer(
  program: IProgram,
  app: Express,
  workerPool: JestWorker = WorkerPool.create()
): Promise<IServer> {
  const directory = program.directory

  const webpackActivity = report.activityTimer(`Building development bundle`, {
    id: `webpack-develop`,
  })
  webpackActivity.start()

  // Remove the following when merging GATSBY_EXPERIMENTAL_DEV_SSR
  const directoryPath = withBasePath(directory)
  const { buildHTML } = require(`../commands/build-html`)
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
  const indexHTMLActivity = report.phantomActivity(`building index.html`, {})

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    const { buildRenderer } = require(`../commands/build-html`)
    await buildRenderer(program, Stage.DevelopHTML)
    const { initDevWorkerPool } = require(`./dev-ssr/render-dev-html`)
    initDevWorkerPool()
  } else {
    indexHTMLActivity.start()

    await createIndexHtml(indexHTMLActivity)

    indexHTMLActivity.end()
  }

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
  app.use(compression())
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
          extensions(): { [key: string]: unknown } {
            return {
              enableRefresh: process.env.ENABLE_GATSBY_REFRESH_ENDPOINT,
              refreshToken: process.env.GATSBY_REFRESH_TOKEN,
            }
          },
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
   * This behavior is disabled by default, but the ENABLE_GATSBY_REFRESH_ENDPOINT env var enables it
   * If no GATSBY_REFRESH_TOKEN env var is available, then no Authorization header is required
   **/
  const REFRESH_ENDPOINT = `/__refresh`
  const refresh = async (req: express.Request): Promise<void> => {
    emitter.emit(`WEBHOOK_RECEIVED`, {
      webhookBody: req.body,
    })
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

  app.get(
    `/page-data/:pagePath(*)/page-data.json`,
    async (req, res, next): Promise<void> => {
      const requestedPagePath = req.params.pagePath
      if (!requestedPagePath) {
        next()
        return
      }

      const potentialPagePath = reverseFixedPagePath(requestedPagePath)
      const page = findPageByPath(store.getState(), potentialPagePath, false)

      if (page) {
        try {
          const pageData: IPageDataWithQueryResult = process.env
            .GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND
            ? await getPageDataExperimental(page.path)
            : await readPageData(
                path.join(store.getState().program.directory, `public`),
                page.path
              )

          res.status(200).send(pageData)
          return
        } catch (e) {
          report.error(
            `Error loading a result for the page query in "${requestedPagePath}" / "${potentialPagePath}". Query was not run and no cached result was found.`,
            e
          )
        }
      }

      res.status(404).send({
        path: potentialPagePath,
      })
    }
  )

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

  await apiRunnerNode(`onCreateDevServer`, { app, deferNodeMutation: true })

  // In case nothing before handled hot-update - send 404.
  // This fixes "Unexpected token < in JSON at position 0" runtime
  // errors after restarting development server and
  // cause automatic hard refresh in the browser.
  app.use(/.*\.hot-update\.json$/i, (_, res) => {
    res.status(404).end()
  })

  // Render an HTML page and serve it.
  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    // Setup HTML route.
    const { route } = require(`./dev-ssr/develop-html-route`)
    route({ app, program, store })
  }

  app.use(async (req, res) => {
    const fullUrl = req.protocol + `://` + req.get(`host`) + req.originalUrl
    // This isn't used in development.
    if (fullUrl.endsWith(`app-data.json`)) {
      res.json({ webpackCompilationHash: `123` })
      // If this gets here, it's a non-existant file so just send back 404.
    } else if (fullUrl.endsWith(`.json`)) {
      res.json({}).status(404)
    } else {
      if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
        try {
          const { renderDevHTML } = require(`./dev-ssr/render-dev-html`)
          const renderResponse = await renderDevHTML({
            path: `/dev-404-page/`,
            // Let renderDevHTML figure it out.
            page: undefined,
            store,
            htmlComponentRendererPath: `${program.directory}/public/render-page.js`,
            directory: program.directory,
          })
          const status = process.env.GATSBY_EXPERIMENTAL_DEV_SSR ? 404 : 200
          res.status(status).send(renderResponse)
        } catch (e) {
          report.error(e)
          res.send(e).status(500)
        }
      } else {
        res.sendFile(directoryPath(`public/index.html`), err => {
          if (err) {
            res.status(500).end()
          }
        })
      }
    }
  })

  /**
   * Set up the HTTP server and socket.io.
   **/
  const server = new http.Server(app)

  const socket = websocketManager.init({ server })

  // hardcoded `localhost`, because host should match `target` we set
  // in http proxy in `develop-proxy`
  const listener = server.listen(program.port, `localhost`)

  if (!process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    const chokidar = require(`chokidar`)
    const { slash } = require(`gatsby-core-utils`)
    // Register watcher that rebuilds index.html every time html.js changes.
    const watchGlobs = [`src/html.js`, `plugins/**/gatsby-ssr.js`].map(path =>
      slash(directoryPath(path))
    )

    chokidar.watch(watchGlobs).on(`change`, async () => {
      await createIndexHtml(indexHTMLActivity)
      // eslint-disable-next-line no-unused-expressions
      socket?.to(`clients`).emit(`reload`)
    })
  }

  return {
    compiler,
    listener,
    webpackActivity,
    websocketManager,
    workerPool,
    webpackWatching: webpackDevMiddlewareInstance.context.watching,
  }
}
