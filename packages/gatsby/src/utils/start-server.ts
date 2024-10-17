import webpackHotMiddleware from "@gatsbyjs/webpack-hot-middleware"
import webpackDevMiddleware, { type Watching } from "webpack-dev-middleware"
import got, { Method } from "got"
import webpack, { Compilation } from "webpack"
import express from "express"
import compression from "compression"
import { createHandler as createGraphqlEndpointHandler } from "graphql-http/lib/use/express"
import type { OperationContext } from "graphql-http"
import graphiqlExplorer from "gatsby-graphiql-explorer"
import { FragmentDefinitionNode, GraphQLError, Kind } from "graphql"
import { slash, uuid } from "gatsby-core-utils"
import http from "http"
import https from "https"
import cors from "cors"
import launchEditor from "react-dev-utils/launchEditor"
import { codeFrameColumns } from "@babel/code-frame"
import * as fs from "fs-extra"

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
import * as path from "path"

import { Stage, IProgram } from "../commands/types"
import { findOriginalSourcePositionAndContent } from "./stack-trace-utils"
import { appendPreloadHeaders } from "./develop-preload-headers"
import {
  routeLoadingIndicatorRequests,
  writeVirtualLoadingIndicatorModule,
} from "./loading-indicator"
import { renderDevHTML } from "./dev-ssr/render-dev-html"
import { getServerData, IServerData } from "./get-server-data"
import { ROUTES_DIRECTORY } from "../constants"
import { getPageMode } from "./page-mode"
import { configureTrailingSlash } from "./express-middlewares"
import type { Express } from "express"
import { addImageRoutes } from "gatsby-plugin-utils/polyfill-remote-file"
import { isFileInsideCompilations } from "./webpack/utils/is-file-inside-compilations"

type ActivityTracker = any // TODO: Replace this with proper type once reporter is typed

export type WebpackWatching = NonNullable<Watching>

interface IServer {
  compiler: webpack.Compiler
  listener: http.Server | https.Server
  webpackActivity: ActivityTracker
  websocketManager: WebsocketManager
  workerPool: WorkerPool.GatsbyWorkerPool
  webpackWatching: WebpackWatching
}

export async function startServer(
  program: IProgram,
  app: Express,
  workerPool: WorkerPool.GatsbyWorkerPool = WorkerPool.create()
): Promise<IServer> {
  const directory = program.directory
  const PAGE_RENDERER_PATH = path.join(
    program.directory,
    ROUTES_DIRECTORY,
    `render-page.js`
  )

  const webpackActivity = report.activityTimer(`Building development bundle`, {
    id: `webpack-develop`,
  })
  webpackActivity.start()

  // loading indicator
  // write virtual module always to not fail webpack compilation, but only add express route handlers when
  // query on demand is enabled and loading indicator is not disabled
  writeVirtualLoadingIndicatorModule()

  // Remove the following when merging GATSBY_EXPERIMENTAL_DEV_SSR
  const directoryPath = withBasePath(directory)
  const { buildRenderer, doBuildPages } = require(`../commands/build-html`)
  const createIndexHtml = async (activity: ActivityTracker): Promise<void> => {
    try {
      const { rendererPath, close } = await buildRenderer(
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
      // close the compiler
      await close()
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
    Stage.Develop,
    program.port,
    {
      parentSpan: webpackActivity.span,
    }
  )

  const compiler = webpack(devConfig)

  /**
   * Set up the express app.
   **/
  app.use(compression())
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

  app.use(
    graphqlEndpoint,
    createGraphqlEndpointHandler({
      schema() {
        return store.getState().schema
      },
      context() {
        return withResolverContext({
          schema: store.getState().schema,
          schemaComposer: store.getState().schemaCustomization.composer,
          context: {},
          customContext: store.getState().schemaCustomization.context,
        }) as unknown as OperationContext
      },
      onOperation(_req, _args, result) {
        if (result.errors) {
          result.errors = result.errors.map(
            err =>
              ({
                ...err.toJSON(),
                extensions: {
                  stack: err.stack ? err.stack.split(`\n`) : [],
                },
              } as unknown as GraphQLError)
          )
        }

        result.extensions = {
          enableRefresh: process.env.ENABLE_GATSBY_REFRESH_ENDPOINT,
          refreshToken: process.env.GATSBY_REFRESH_TOKEN,
        }

        return result
      },
    })
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
    global.__GATSBY.buildId = uuid.v4()

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
    if (req.query.fileName) {
      const fileName = path.resolve(process.cwd(), req.query.fileName as string)
      const lineNumber = parseInt(req.query.lineNumber as string, 10)
      launchEditor(fileName, isNaN(lineNumber) ? 1 : lineNumber)
    }
    res.end()
  })

  addImageRoutes(app, store)

  const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
    publicPath: devConfig.output.publicPath,
    stats: `errors-only`,
    serverSideRender: true,
  })

  app.use(webpackDevMiddlewareInstance)

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
          let serverDataPromise: Promise<IServerData> | Promise<Error> =
            Promise.resolve({})
          const pageMode = getPageMode(page)

          if (pageMode === `SSR`) {
            const renderer = require(PAGE_RENDERER_PATH)
            const componentInstance = await renderer.getPageChunk(page)

            serverDataPromise = getServerData(
              req,
              page,
              potentialPagePath,
              componentInstance
            ).catch(error => error)
          }

          let pageData: IPageDataWithQueryResult
          // TODO move to query-engine
          if (process.env.GATSBY_QUERY_ON_DEMAND) {
            pageData = await getPageDataExperimental(page.path)
          } else {
            pageData = await readPageData(
              path.join(store.getState().program.directory, `public`),
              page.path
            )
          }

          let statusCode = 200
          if (pageMode === `SSR`) {
            try {
              const result = await serverDataPromise

              if (result instanceof Error) {
                throw result
              }

              if (result.headers) {
                for (const [name, value] of Object.entries(result.headers)) {
                  res.setHeader(name, value)
                }
              }

              if (result.status) {
                statusCode = result.status
              }

              pageData.result.serverData = result.props
              pageData.getServerDataError = null
            } catch (error) {
              const structuredError = report.panicOnBuild({
                id: `95315`,
                context: {
                  sourceMessage: error.message,
                  pagePath: requestedPagePath,
                  potentialPagePath,
                },
                error,
              })
              // Use page-data.json file instead of emitting via websockets as this makes it easier
              // to only display the relevant error + clearing of the error
              // The query-result-store reacts to this
              pageData.getServerDataError = structuredError
            }
            pageData.path = page.matchPath ? `/${potentialPagePath}` : page.path
          } else {
            // When user removes getServerData function, Gatsby browser runtime still has cached version of page-data.
            // Send `null` to always reset cached serverData:
            pageData.result.serverData = null
          }

          res.status(statusCode).send(pageData)
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

  app.get(`/__original-stack-frame`, (req, res) => {
    const emptyResponse = {
      codeFrame: `No codeFrame could be generated`,
      sourcePosition: null,
      sourceContent: null,
    }

    let sourceContent: string | null
    let sourceLine: number | undefined
    let sourceColumn: number | undefined
    let sourceEndLine: number | undefined
    let sourceEndColumn: number | undefined
    let sourcePosition: { line?: number; column?: number } | null

    if (req.query?.skipSourceMap) {
      if (!req.query?.moduleId) {
        res.json(emptyResponse)
        return
      }

      const absolutePath = path.resolve(
        store.getState().program.directory,
        req.query.moduleId as string
      )

      const compilation: Compilation =
        res.locals?.webpack?.devMiddleware?.stats?.compilation
      if (!compilation) {
        res.json(emptyResponse)
        return
      }

      if (!isFileInsideCompilations(absolutePath, compilation)) {
        res.json(emptyResponse)
        return
      }

      try {
        sourceContent = fs.readFileSync(absolutePath, `utf-8`)
      } catch (e) {
        res.json(emptyResponse)
        return
      }

      if (req.query?.lineNumber) {
        try {
          sourceLine = parseInt(req.query.lineNumber as string, 10)

          if (req.query?.endLineNumber) {
            sourceEndLine = parseInt(req.query.endLineNumber as string, 10)
          }
          if (req.query?.columnNumber) {
            sourceColumn = parseInt(req.query.columnNumber as string, 10)
          }
          if (req.query?.endColumnNumber) {
            sourceEndColumn = parseInt(req.query.endColumnNumber as string, 10)
          }
        } catch {
          // failed to get line/column, we should still try to show the code frame
        }
      }
      sourcePosition = {
        line: sourceLine,
        column: sourceColumn,
      }
    } else {
      const compilation = res.locals?.webpack?.devMiddleware?.stats?.compilation
      if (!compilation) {
        res.json(emptyResponse)
        return
      }

      const moduleId = req.query?.moduleId
      const lineNumber = parseInt((req.query?.lineNumber as string) ?? 1, 10)
      const columnNumber = parseInt(
        (req.query?.columnNumber as string) ?? 1,
        10
      )

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
      const result = findOriginalSourcePositionAndContent(sourceMap, position)

      sourcePosition = result?.sourcePosition
      sourceLine = sourcePosition?.line
      sourceColumn = sourcePosition?.column
      sourceContent = result?.sourceContent

      if (!sourceContent || !sourceLine) {
        res.json(emptyResponse)
        return
      }
    }

    const codeFrame = codeFrameColumns(
      sourceContent,
      {
        start: {
          line: sourceLine ?? 0,
          column: sourceColumn ?? 0,
        },
        end: sourceEndLine
          ? {
              line: sourceEndLine,
              column: sourceEndColumn,
            }
          : undefined,
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

  app.get(`/__file-code-frame`, async (req, res) => {
    const emptyResponse = {
      codeFrame: `No codeFrame could be generated`,
      sourcePosition: null,
      sourceContent: null,
    }

    const filePath: string | undefined = req.query?.filePath as string
    const lineNumber = parseInt(req.query?.lineNumber as string, 10)
    const columnNumber = parseInt(req.query?.columnNumber as string, 10)

    if (!filePath) {
      res.json(emptyResponse)
      return
    }

    const absolutePath = path.resolve(
      store.getState().program.directory,
      filePath
    )

    const compilation: Compilation =
      res.locals?.webpack?.devMiddleware?.stats?.compilation
    if (!compilation) {
      res.json(emptyResponse)
      return
    }

    if (!isFileInsideCompilations(absolutePath, compilation)) {
      res.json(emptyResponse)
      return
    }

    const sourceContent = await fs.readFile(absolutePath, `utf-8`)

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
    res.json({
      codeFrame,
    })
  })

  // Expose access to app for advanced use cases
  const { developMiddleware } = store.getState().config

  if (developMiddleware) {
    developMiddleware(app)
  }

  const { proxy, trailingSlash } = store.getState().config

  app.use(configureTrailingSlash(() => store.getState(), trailingSlash))

  // Disable directory indexing i.e. serving index.html from a directory.
  // This can lead to serving stale html files during development.
  //
  // We serve by default an empty index.html that sets up the dev environment.
  app.use(developStatic(`public`, { index: false }))

  // Set up API proxy.
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
              .stream(proxiedUrl, {
                headers,
                method: method as Method,
                decompress: false,
              })
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
      const pathObj = findPageByPath(store.getState(), decodeURI(req.path))

      if (!pathObj) {
        return next()
      }

      const allowTimedFallback = !req.headers[`x-gatsby-wait-for-dev-ssr`]

      await appendPreloadHeaders(pathObj.path, res)

      const htmlActivity = report.phantomActivity(`building HTML for path`, {})
      htmlActivity.start()

      try {
        const { html: renderResponse, serverData } = await renderDevHTML({
          path: pathObj.path,
          page: pathObj,
          skipSsr: Object.prototype.hasOwnProperty.call(req.query, `skip-ssr`),
          store,
          allowTimedFallback,
          htmlComponentRendererPath: PAGE_RENDERER_PATH,
          directory: program.directory,
          req,
        })

        if (serverData?.headers) {
          for (const [name, value] of Object.entries(serverData.headers)) {
            res.setHeader(name, value)
          }
        }
        let statusCode = 200
        if (serverData?.status) {
          statusCode = serverData.status
        }
        res.status(statusCode).send(renderResponse)
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
          sourceMessage: error?.message,
          stack: error?.stack,
        }

        try {
          // Generate a shell for client-only content -- for the error overlay
          const { html: clientOnlyShell } = await renderDevHTML({
            path: pathObj.path,
            page: pathObj,
            skipSsr: true,
            store,
            error: message,
            htmlComponentRendererPath: PAGE_RENDERER_PATH,
            directory: program.directory,
            req,
            allowTimedFallback,
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

          const minimalHTML = `<head><title>Failed to Server Render (SSR)</title></head><body><h1>Failed to Server Render (SSR)</h1><h2>Error message:</h2><p>${e.message}</p><h2>File:</h2><p>${e.filename}:${e.line}:${e.column}</p><h2>Stack:</h2><pre><code>${e.stack}</code></pre></body>`

          res.send(minimalHTML).status(500)
        }
      }

      htmlActivity.end()

      return null
    })
  }

  if (
    process.env.GATSBY_QUERY_ON_DEMAND &&
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
          const allowTimedFallback = !req.headers[`x-gatsby-wait-for-dev-ssr`]
          const { html: renderResponse } = await renderDevHTML({
            path: `/dev-404-page/`,
            // Let renderDevHTML figure it out.
            page: undefined,
            store,
            htmlComponentRendererPath: pageRenderer,
            directory: program.directory,
            req,
            allowTimedFallback,
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
        const potentialPagePath = reverseFixedPagePath(decodeURI(req.path))
        const page = findPageByPath(store.getState(), potentialPagePath, false)

        // When we can't find a page we send 404
        if (!page) {
          res.status(404)
        }

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
  const server = program.ssl
    ? new https.Server(program.ssl, app)
    : new http.Server(app)
  const socket = websocketManager.init({ server })
  const listener = server.listen(program.port, program.host)

  if (!process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    const chokidar = require(`chokidar`)
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
    webpackWatching: webpackDevMiddlewareInstance.context
      .watching as WebpackWatching,
  }
}
