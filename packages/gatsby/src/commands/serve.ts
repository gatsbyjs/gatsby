import path from "path"
import openurl from "better-opn"
import fs from "fs-extra"
import compression from "compression"
import express from "express"
import chalk from "chalk"
import { match as reachMatch } from "@reach/router/lib/utils"
import onExit from "signal-exit"
import report from "gatsby-cli/lib/reporter"

import telemetry from "gatsby-telemetry"

import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import getConfigFile from "../bootstrap/get-config-file"
import preferDefault from "../bootstrap/prefer-default"
import { IProgram } from "./types"

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
): Promise<IMatchPath[]> => {
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
  return JSON.parse(rawJSON) as IMatchPath[]
}

const matchPathRouter = (
  matchPaths: IMatchPath[],
  options: {
    root: string
  }
) => (
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
  router.use((req, res, next) => {
    if (req.accepts(`html`)) {
      return res.status(404).sendFile(`404.html`, { root })
    }
    return next()
  })
  app.use(function(
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

  const startListening = (): void => {
    app.listen(port, host, () => {
      const openUrlString = `http://${host}:${port}${pathPrefix}`
      report.info(`gatsby serve running at: ${chalk.bold(openUrlString)}`)
      if (open) {
        report.info(`Opening browser...`)
        Promise.resolve(openurl(openUrlString)).catch(() =>
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
