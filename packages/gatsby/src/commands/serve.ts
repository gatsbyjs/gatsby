import path from "path"
import openurl from "better-opn"
import fs from "fs-extra"
import compression from "compression"
import express from "express"
import chalk from "chalk"
import { match as reachMatch } from "@gatsbyjs/reach-router/lib/utils"
import onExit from "signal-exit"
import report from "gatsby-cli/lib/reporter"
import multer from "multer"
import cookie from "cookie"
import telemetry from "gatsby-telemetry"

import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import { getConfigFile } from "../bootstrap/get-config-file"
import { preferDefault } from "../bootstrap/prefer-default"
import { IProgram } from "./types"
import { IPreparedUrls, prepareUrls } from "../utils/prepare-urls"
import { IGatsbyFunction } from "../redux/types"
import { reverseFixedPagePath } from "../utils/page-data"
import { initTracer } from "../utils/tracer"

interface IMatchPath {
  path: string
  matchPath: string
}

interface IServeProgram extends IProgram {
  prefixPaths: boolean
}

onExit(() => {
  telemetry.trackCli(`SERVE_STOP`)
})

const readMatchPaths = async (
  program: IServeProgram
): Promise<Array<IMatchPath>> => {
  const filePath = path.join(program.directory, `.cache`, `match-paths.json`)
  let rawJSON = `[]`
  try {
    rawJSON = await fs.readFile(filePath, `utf8`)
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
  return JSON.parse(rawJSON) as Array<IMatchPath>
}

const matchPathRouter =
  (
    matchPaths: Array<IMatchPath>,
    options: {
      root: string
    }
  ) =>
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
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

module.exports = async (program: IServeProgram): Promise<void> => {
  telemetry.trackCli(`SERVE_START`)
  telemetry.startBackgroundUpdate()
  await initTracer(
    process.env.GATSBY_OPEN_TRACING_CONFIG_FILE || program.openTracingConfigFile
  )
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
  // eslint-disable-next-line new-cap
  const router = express.Router()

  app.use(telemetry.expressMiddleware(`SERVE`))

  router.use(compression())
  router.use(express.static(`public`, { dotfiles: `allow` }))

  const compiledFunctionsDir = path.join(
    program.directory,
    `.cache`,
    `functions`
  )

  let functions: Array<IGatsbyFunction> = []
  try {
    functions = JSON.parse(
      fs.readFileSync(path.join(compiledFunctionsDir, `manifest.json`), `utf-8`)
    )
  } catch (e) {
    // ignore
  }

  if (functions) {
    app.use(
      `/api/*`,
      multer().any(),
      express.urlencoded({ extended: true }),
      (req, _, next) => {
        const cookies = req.headers.cookie

        if (!cookies) {
          return next()
        }

        req.cookies = cookie.parse(cookies)

        return next()
      },
      express.text(),
      express.json(),
      express.raw(),
      async (req, res, next) => {
        const { "0": pathFragment } = req.params

        // Check first for exact matches.
        let functionObj = functions.find(
          ({ functionRoute }) => functionRoute === pathFragment
        )

        if (!functionObj) {
          // Check if there's any matchPaths that match.
          // We loop until we find the first match.
          functions.some(f => {
            if (f.matchPath) {
              const matchResult = reachMatch(f.matchPath, pathFragment)
              if (matchResult) {
                req.params = matchResult.params
                if (req.params[`*`]) {
                  // Backwards compatability for v3
                  // TODO remove in v5
                  req.params[`0`] = req.params[`*`]
                }
                functionObj = f

                return true
              }
            }

            return false
          })
        }

        if (functionObj) {
          const pathToFunction = functionObj.absoluteCompiledFilePath
          const start = Date.now()

          try {
            delete require.cache[require.resolve(pathToFunction)]
            const fn = require(pathToFunction)

            const fnToExecute = (fn && fn.default) || fn

            await Promise.resolve(fnToExecute(req, res))
          } catch (e) {
            console.error(e)
            // Don't send the error if that would cause another error.
            if (!res.headersSent) {
              res.sendStatus(500)
            }
          }

          const end = Date.now()
          console.log(
            `Executed function "/api/${functionObj.functionRoute}" in ${
              end - start
            }ms`
          )

          return
        } else {
          next()
        }
      }
    )
  }

  // Handle SSR & DSG Pages
  if (_CFLAGS_.GATSBY_MAJOR === `4`) {
    try {
      const { GraphQLEngine } = require(path.join(
        program.directory,
        `.cache`,
        `query-engine`
      )) as typeof import("../schema/graphql-engine/entry")
      const { getData, renderPageData, renderHTML } = require(path.join(
        program.directory,
        `.cache`,
        `page-ssr`
      )) as typeof import("../utils/page-ssr-module/entry")
      const graphqlEngine = new GraphQLEngine({
        dbPath: path.join(program.directory, `.cache`, `data`, `datastore`),
      })

      app.get(
        `/page-data/:pagePath(*)/page-data.json`,
        async (req, res, next) => {
          const requestedPagePath = req.params.pagePath
          if (!requestedPagePath) {
            return void next()
          }

          const potentialPagePath = reverseFixedPagePath(requestedPagePath)
          const page = graphqlEngine.findPageByPath(potentialPagePath)

          if (page && (page.mode === `DSG` || page.mode === `SSR`)) {
            const requestActivity = report.phantomActivity(
              `request for "${req.path}"`
            )
            requestActivity.start()
            try {
              const spanContext = requestActivity.span.context()
              const data = await getData({
                pathName: req.path,
                graphqlEngine,
                req,
                spanContext,
              })
              const results = await renderPageData({ data, spanContext })
              if (page.mode === `SSR` && data.serverDataHeaders) {
                for (const [name, value] of Object.entries(
                  data.serverDataHeaders
                )) {
                  res.setHeader(name, value)
                }
              }

              if (page.mode === `SSR` && data.serverDataStatus) {
                return void res.status(data.serverDataStatus).send(results)
              } else {
                return void res.send(results)
              }
            } catch (e) {
              report.error(
                `Generating page-data for "${requestedPagePath}" / "${potentialPagePath}" failed.`,
                e
              )
              return res
                .status(500)
                .contentType(`text/plain`)
                .send(`Internal server error.`)
            } finally {
              requestActivity.end()
            }
          }

          return void next()
        }
      )

      router.use(async (req, res, next) => {
        if (req.accepts(`html`)) {
          const potentialPagePath = req.path
          const page = graphqlEngine.findPageByPath(potentialPagePath)
          if (page && (page.mode === `DSG` || page.mode === `SSR`)) {
            const requestActivity = report.phantomActivity(
              `request for "${req.path}"`
            )
            requestActivity.start()

            try {
              const spanContext = requestActivity.span.context()
              const data = await getData({
                pathName: potentialPagePath,
                graphqlEngine,
                req,
                spanContext,
              })
              const results = await renderHTML({ data, spanContext })
              if (page.mode === `SSR` && data.serverDataHeaders) {
                for (const [name, value] of Object.entries(
                  data.serverDataHeaders
                )) {
                  res.setHeader(name, value)
                }
              }

              if (page.mode === `SSR` && data.serverDataStatus) {
                return void res.status(data.serverDataStatus).send(results)
              } else {
                return void res.send(results)
              }
            } catch (e) {
              report.error(
                `Rendering html for "${potentialPagePath}" failed.`,
                e
              )
              return res.status(500).sendFile(`500.html`, { root }, err => {
                if (err) {
                  res.contentType(`text/plain`).send(`Internal server error.`)
                }
              })
            } finally {
              requestActivity.end()
            }
          }
        }
        return next()
      })
    } catch (error) {
      // TODO: Handle case of engine not being generated
    }
  }

  const matchPaths = await readMatchPaths(program)
  router.use(matchPathRouter(matchPaths, { root }))

  // TODO: Remove/merge with above same block
  router.use((req, res, next) => {
    if (req.accepts(`html`)) {
      return res.status(404).sendFile(`404.html`, { root })
    }
    return next()
  })
  app.use(function (
    _: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res.header(`Access-Control-Allow-Origin`, `*`)
    res.header(
      `Access-Control-Allow-Headers`,
      `Origin, X-Requested-With, Content-Type, Accept`
    )
    next()
  })
  app.use(pathPrefix, router)

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
  }

  const startListening = (): void => {
    app.listen(port, host, () => {
      const urls = prepareUrls(
        program.ssl ? `https` : `http`,
        program.host,
        port
      )
      printInstructions(
        program.sitePackageJson.name || `(Unnamed package)`,
        urls
      )
      if (open) {
        report.info(`Opening browser...`)
        Promise.resolve(openurl(urls.localUrlForBrowser)).catch(() =>
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
