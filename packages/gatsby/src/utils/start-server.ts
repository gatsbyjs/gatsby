import webpackHotMiddleware from "@gatsbyjs/webpack-hot-middleware"
import webpackDevMiddleware from "webpack-dev-middleware"
import got from "got"
import webpack from "webpack"
import express from "express"
import compression from "compression"
import graphqlHTTP from "express-graphql"
import graphqlPlayground from "graphql-playground-middleware-express"
import graphiqlExplorer from "gatsby-graphiql-explorer"
import { formatError, FragmentDefinitionNode, Kind } from "graphql"
import { isCI } from "gatsby-core-utils"
import http from "http"
import https from "https"
import cors from "cors"
import telemetry from "gatsby-telemetry"
import launchEditor from "react-dev-utils/launchEditor"
import { codeFrameColumns } from "@babel/code-frame"

import { withBasePath } from "../utils/path"
import webpackConfig from "../utils/webpack.config"
import { store, emitter } from "../redux"
import report from "gatsby-cli/lib/reporter"
import * as WorkerPool from "../utils/worker/pool"

import { developStatic } from "../commands/develop-static"
import withResolverContext from "../schema/context"
import { websocketManager, WebsocketManager } from "../utils/websocket-manager"
import {
  showExperimentNoticeAfterTimeout,
  CancelExperimentNoticeCallbackOrUndefined,
} from "../utils/show-experiment-notice"
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
import { findOriginalSourcePositionAndContent } from "./stack-trace-utils"
import { appendPreloadHeaders } from "./develop-preload-headers"
import {
  routeLoadingIndicatorRequests,
  writeVirtualLoadingIndicatorModule,
} from "./loading-indicator"
import { renderDevHTML } from "./dev-ssr/render-dev-html"

type ActivityTracker = any // TODO: Replace this with proper type once reporter is typed

interface IServer {
  compiler: webpack.Compiler
  listener: http.Server | https.Server
  webpackActivity: ActivityTracker
  cancelDevJSNotice: CancelExperimentNoticeCallbackOrUndefined
  websocketManager: WebsocketManager
  workerPool: JestWorker
  webpackWatching: IWebpackWatchingPauseResume
}

export interface IWebpackWatchingPauseResume {
  suspend: () => void
  resume: () => void
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

  // loading indicator
  // write virtual module always to not fail webpack compilation, but only add express route handlers when
  // query on demand is enabled and loading indicator is not disabled
  writeVirtualLoadingIndicatorModule()

  const THIRTY_SECONDS = 30 * 1000
  let cancelDevJSNotice: CancelExperimentNoticeCallbackOrUndefined
  if (
    process.env.gatsby_executing_command === `develop` &&
    !process.env.GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE &&
    !isCI()
  ) {
    cancelDevJSNotice = showExperimentNoticeAfterTimeout(
      `Preserve webpack's Cache`,
      `https://github.com/gatsbyjs/gatsby/discussions/28331`,
      `which changes Gatsby's cache clearing behavior to not clear webpack's
cache unless you run "gatsby clean" or delete the .cache folder manually.
Here's how to try it:

module.exports = {
  flags: { PRESERVE_WEBPACK_CACHE: true },
  plugins: [...]
}`,
      THIRTY_SECONDS
    )
  }

  // Remove the following when merging GATSBY_EXPERIMENTAL_DEV_SSR
  const directoryPath = withBasePath(directory)
  const { buildRenderer, doBuildPages } = require(`../commands/build-html`)
  const createIndexHtml = async (activity: ActivityTracker): Promise<void> => {
    try {
      const { rendererPath } = await buildRenderer(
        program,
        Stage.DevelopHTML,
        activity.span
      )
      await doBuildPages(
        rendererPath,
        [`/`],
        activity,
        workerPool,
        Stage.DevelopHTML
      )
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

  let pageRenderer: string
  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    const { buildRenderer } = require(`../commands/build-html`)
    pageRenderer = (await buildRenderer(program, Stage.DevelopHTML))
      .rendererPath
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
      getFragments: function getFragments(): Array<FragmentDefinitionNode> {
        const fragments: Array<FragmentDefinitionNode> = []
        for (const def of store.getState().definitions.values()) {
          if (def.def.kind === Kind.FRAGMENT_DEFINITION) {
            fragments.push(def.def)
          }
        }
        return fragments
      },
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
  const refresh = async (
    req: express.Request,
    pluginName?: string
  ): Promise<void> => {
    emitter.emit(`WEBHOOK_RECEIVED`, {
      webhookBody: req.body,
      pluginName,
    })
  }

  app.post(`${REFRESH_ENDPOINT}/:plugin_name?`, express.json(), (req, res) => {
    const pluginName = req.params[`plugin_name`]

    const enableRefresh = process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
    const refreshToken = process.env.GATSBY_REFRESH_TOKEN
    const authorizedRefresh =
      !refreshToken || req.headers.authorization === refreshToken

    if (enableRefresh && authorizedRefresh) {
      refresh(req, pluginName)
      res.status(200)
      res.setHeader(`content-type`, `application/json`)
    } else {
      res.status(authorizedRefresh ? 404 : 403)
      res.json({
        error: enableRefresh
          ? `Authorization failed. Make sure you add authorization header to your refresh requests`
          : `Refresh endpoint is not enabled. Run gatsby with "ENABLE_GATSBY_REFRESH_ENDPOINT=true" environment variable set.`,
        isEnabled: !!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT,
      })
    }
    res.end()
  })

  app.get(`/__open-stack-frame-in-editor`, (req, res) => {
    const fileName = path.resolve(process.cwd(), req.query.fileName)
    const lineNumber = parseInt(req.query.lineNumber, 10)
    launchEditor(fileName, isNaN(lineNumber) ? 1 : lineNumber)
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
          let pageData: IPageDataWithQueryResult
          if (process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND) {
            const start = Date.now()

            pageData = await getPageDataExperimental(page.path)

            telemetry.trackCli(`RUN_QUERY_ON_DEMAND`, {
              name: `getPageData`,
              duration: Date.now() - start,
            })
          } else {
            pageData = await readPageData(
              path.join(store.getState().program.directory, `public`),
              page.path
            )
          }

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

  const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
    publicPath: devConfig.output.publicPath,
    stats: `errors-only`,
    serverSideRender: true,
  })

  app.use(webpackDevMiddlewareInstance)

  app.get(`/__original-stack-frame`, async (req, res) => {
    const compilation = res.locals?.webpack?.devMiddleware?.stats?.compilation
    const emptyResponse = {
      codeFrame: `No codeFrame could be generated`,
      sourcePosition: null,
      sourceContent: null,
    }

    if (!compilation) {
      res.json(emptyResponse)
      return
    }

    const moduleId = req?.query?.moduleId
    const lineNumber = parseInt(req.query.lineNumber, 10)
    const columnNumber = parseInt(req.query.columnNumber, 10)

    let fileModule
    for (const module of compilation.modules) {
      const moduleIdentifier = compilation.chunkGraph.getModuleId(module)
      if (moduleIdentifier === moduleId) {
        fileModule = module
        break
      }
    }

    if (!fileModule) {
      res.json(emptyResponse)
      return
    }

    // We need the internal webpack file that is used in the bundle, not the module source.
    // It doesn't have the correct sourceMap.
    const webpackSource = compilation?.codeGenerationResults
      ?.get(fileModule)
      ?.sources.get(`javascript`)

    const sourceMap = webpackSource?.map()

    if (!sourceMap) {
      res.json(emptyResponse)
      return
    }

    const position = {
      line: lineNumber,
      column: columnNumber,
    }
    const result = await findOriginalSourcePositionAndContent(
      sourceMap,
      position
    )

    const sourcePosition = result?.sourcePosition
    const sourceLine = sourcePosition?.line
    const sourceColumn = sourcePosition?.column
    const sourceContent = result?.sourceContent

    if (!sourceContent || !sourceLine) {
      res.json(emptyResponse)
      return
    }

    const codeFrame = codeFrameColumns(
      sourceContent,
      {
        start: {
          line: sourceLine,
          column: sourceColumn ?? 0,
        },
      },
      {
        highlightCode: true,
      }
    )
    res.json({
      codeFrame,
      sourcePosition,
      sourceContent,
    })
  })

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
    app.get(`*`, async (req, res, next) => {
      telemetry.trackFeatureIsUsed(`GATSBY_EXPERIMENTAL_DEV_SSR`)

      const pathObj = findPageByPath(store.getState(), decodeURI(req.path))

      if (!pathObj) {
        return next()
      }

      await appendPreloadHeaders(pathObj.path, res)

      const htmlActivity = report.phantomActivity(`building HTML for path`, {})
      htmlActivity.start()

      try {
        const renderResponse = await renderDevHTML({
          path: pathObj.path,
          page: pathObj,
          skipSsr: req.query[`skip-ssr`] || false,
          store,
          htmlComponentRendererPath: `${program.directory}/public/render-page.js`,
          directory: program.directory,
        })
        res.status(200).send(renderResponse)
      } catch (error) {
        // The page errored but couldn't read the page component.
        // This is a race condition when a page is deleted but its requested
        // immediately after before anything can recompile.
        if (error === `404 page`) {
          return next()
        }

        // renderDevHTML throws an error with these information
        const lineNumber = error?.line as number
        const columnNumber = error?.column as number
        const filePath = error?.filename as string
        const sourceContent = error?.sourceContent as string

        report.error({
          id: `11614`,
          context: {
            path: pathObj.path,
            filePath: filePath,
            line: lineNumber,
            column: columnNumber,
          },
        })

        const emptyResponse = {
          codeFrame: `No codeFrame could be generated`,
          sourcePosition: null,
          sourceContent: null,
        }

        if (!sourceContent || !lineNumber) {
          res.json(emptyResponse)
          return null
        }

        const codeFrame = codeFrameColumns(
          sourceContent,
          {
            start: {
              line: lineNumber,
              column: columnNumber ?? 0,
            },
          },
          {
            highlightCode: true,
          }
        )

        const message = {
          codeFrame,
          source: filePath,
          line: lineNumber,
          column: columnNumber ?? 0,
        }

        try {
          // Generate a shell for client-only content -- for the error overlay
          const clientOnlyShell = await renderDevHTML({
            path: pathObj.path,
            page: pathObj,
            skipSsr: true,
            store,
            error: message,
            htmlComponentRendererPath: `${program.directory}/public/render-page.js`,
            directory: program.directory,
          })

          res.send(clientOnlyShell)
        } catch (e) {
          report.error({
            id: `11616`,
            context: {
              sourceMessage: e.message,
            },
            filePath: e.filename,
            location: {
              start: {
                line: e.line,
                column: e.column,
              },
            },
          })
          res.send(e).status(500)
        }
      }

      htmlActivity.end()

      return null
    })
  }

  if (
    process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND &&
    process.env.GATSBY_QUERY_ON_DEMAND_LOADING_INDICATOR === `true`
  ) {
    routeLoadingIndicatorRequests(app)
  }

  app.use(async (req, res) => {
    // in this catch-all block we don't support POST so we should 404
    if (req.method === `POST`) {
      res.status(404).end()
      return
    }

    const fullUrl = req.protocol + `://` + req.get(`host`) + req.originalUrl
    // This isn't used in development.
    if (fullUrl.endsWith(`app-data.json`)) {
      res.json({ webpackCompilationHash: `123` })
      // If this gets here, it's a non-existent file so just send back 404.
    } else if (fullUrl.endsWith(`.json`)) {
      res.json({}).status(404)
    } else {
      await appendPreloadHeaders(req.path, res)

      if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
        try {
          const { renderDevHTML } = require(`./dev-ssr/render-dev-html`)
          const renderResponse = await renderDevHTML({
            path: `/dev-404-page/`,
            // Let renderDevHTML figure it out.
            page: undefined,
            store,
            htmlComponentRendererPath: pageRenderer,
            directory: program.directory,
          })
          res.status(404).send(renderResponse)
        } catch (e) {
          report.error({
            id: `11615`,
            context: {
              sourceMessage: e.message,
            },
            filePath: e.filename,
            location: {
              start: {
                line: e.line,
                column: e.column,
              },
            },
          })
          res.send(e).status(500)
        }
      } else {
        res.sendFile(directoryPath(`.cache/develop-html/index.html`), err => {
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
    cancelDevJSNotice,
    websocketManager,
    workerPool,
    webpackWatching: webpackDevMiddlewareInstance.context.watching,
  }
}
