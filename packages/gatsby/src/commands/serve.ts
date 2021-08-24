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
import pathToRegexp from "path-to-regexp"
import cookie from "cookie"
import telemetry from "gatsby-telemetry"

import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import { getConfigFile } from "../bootstrap/get-config-file"
import { preferDefault } from "../bootstrap/prefer-default"
import { IProgram } from "./types"
import { IPreparedUrls, prepareUrls } from "../utils/prepare-urls"
import { IGatsbyFunction } from "../redux/types"
import { reverseFixedPagePath } from "../utils/page-data"
import handleFlags from "../utils/handle-flags"
import availableFlags from "../utils/flags"

interface IMatchPath {
  path: string
  matchPath: string
}

interface IPathToRegexpKey {
  name: string | number
  prefix: string
  suffix: string
  pattern: string
  modifier: string
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
    report.warn(error.toString())
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
  let { prefixPaths, port, open, host } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  let config
  try {
    const { configModule } = await getConfigFile(
      program.directory,
      `gatsby-config`
    )
    config = preferDefault(configModule)
  } catch (e) {
    // ignore
  }

  const { pathPrefix: configPathPrefix } = config || {}

  if (config) {
    // Get flags
    const { enabledConfigFlags } = handleFlags(availableFlags, config.flags)

    //  set process.env for each flag
    enabledConfigFlags.forEach(flag => {
      process.env[flag.env] = `true`
    })

    //  track usage of feature
    enabledConfigFlags.forEach(flag => {
      if (flag.telemetryId) {
        telemetry.trackFeatureIsUsed(flag.telemetryId)
      }
    })

    // Track the usage of config.flags
    if (config.flags) {
      telemetry.trackFeatureIsUsed(`ConfigFlags`)
    }
  }

  const pathPrefix = prefixPaths && configPathPrefix ? configPathPrefix : `/`

  const root = path.join(program.directory, `public`)

  const app = express()
  // eslint-disable-next-line new-cap
  const router = express.Router()

  app.use(telemetry.expressMiddleware(`SERVE`))

  router.use(compression())
  router.use(express.static(`public`, { dotfiles: `allow` }))
  const matchPaths = await readMatchPaths(program)
  router.use(matchPathRouter(matchPaths, { root }))

  if (process.env.GATSBY_EXPERIMENTAL_GENERATE_ENGINES) {
    const { GraphQLEngine } = require(path.join(
      program.directory,
      `.cache`,
      `query-engine`
    ))
    const { getData, renderPageData, renderHTML } = require(path.join(
      program.directory,
      `.cache`,
      `page-ssr`
    ))
    const graphqlEngine = new GraphQLEngine({
      dbPath: path.join(program.directory, `.cache`, `data`, `datastore`),
    })

    router.get(
      `/page-data/:pagePath(*)/page-data.json`,
      async (req, res, next): Promise<void> => {
        const requestedPagePath = req.params.pagePath
        if (!requestedPagePath) {
          next()
          return
        }

        const pathName = reverseFixedPagePath(requestedPagePath)
        const page = graphqlEngine.findPageByPath(req.path)

        if (page && page.mode === `DSR`) {
          const data = await getData({ pathName, graphqlEngine })
          const results = await renderPageData({ data })
          res.send(results)
          return
        }

        next()
        return
      }
    )

    router.use(async (req, res, next) => {
      if (req.accepts(`html`)) {
        const pathName = req.path
        if (!pathName) {
          next()
          return
        }

        const page = graphqlEngine.findPageByPath(pathName)

        if (page && page.mode === `DSR`) {
          const data = await getData({ pathName, graphqlEngine })
          const results = await renderHTML({ data })
          res.send(results)
          return
        }
      }
      next()
      return
    })
  }

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
    const ssrRoutes = new Map()
    functions.forEach(fn => {
      if (
        fn.functionRoute.startsWith(`_ssr/`) &&
        !fn.functionRoute.startsWith(`_ssr/page-data/`)
      ) {
        let pathName = fn.functionRoute
        let pageDataRoute = fn.functionRoute.replace(`_ssr/`, `_ssr/page-data/`)
        const keys: Array<{ name: string }> = []
        if (fn.matchPath) {
          pathName = pathToRegexp(fn.matchPath, keys)
          pageDataRoute = pathToRegexp(
            fn.matchPath.replace(`_ssr/`, `_ssr/page-data/`) +
              `/page-data.json`,
            []
          )
        }

        ssrRoutes.set(pathName, {
          apiRoute: `/api/${fn.functionRoute}`,
          params: keys.map(key => key.name),
        })
        ssrRoutes.set(pageDataRoute, {
          apiRoute: `/api/${fn.functionRoute.replace(
            `_ssr`,
            `_ssr/page-data`
          )}`,
          params: keys.map(key => key.name),
        })
      }
    })

    app.use(`/`, (req, _, next) => {
      for (const [ssrPath, ssrFn] of ssrRoutes) {
        const match = `_ssr${req.path}`.match(ssrPath)
        if (match) {
          let url = ssrFn.apiRoute
          ssrFn.params.forEach((param, index) => {
            url = url.replace(`[${param}]`, match[index + 1])
          })

          req.url = url
          break
        }
      }

      next()
    })

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
            let exp
            const keys: Array<IPathToRegexpKey> = []
            if (f.matchPath) {
              exp = pathToRegexp(f.matchPath, keys)
            }

            if (exp && exp.exec(pathFragment) !== null) {
              functionObj = f
              // @ts-ignore - TS bug? https://stackoverflow.com/questions/50234481/typescript-2-8-3-type-must-have-a-symbol-iterator-method-that-returns-an-iterato
              const matches = [...pathFragment.match(exp)].slice(1)
              const newParams = {}
              matches.forEach(
                (match, index) => (newParams[keys[index].name] = match)
              )
              req.params = newParams

              return true
            } else {
              return false
            }
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
        program?.sitePackageJson?.name || `(Unnamed package)`,
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
