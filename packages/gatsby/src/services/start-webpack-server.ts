import openurl from "better-opn"
import report from "gatsby-cli/lib/reporter"
import chalk from "chalk"
import { Compiler } from "webpack"
import { Stage } from "../commands/types"

import {
  reportWebpackWarnings,
  structureWebpackErrors,
} from "../utils/webpack-error-utils"

import { showExperimentNotices } from "../utils/show-experiment-notice"
import { printInstructions } from "../utils/print-instructions"
import { prepareUrls } from "../utils/prepare-urls"
import { startServer, WebpackWatching } from "../utils/start-server"
import { WebsocketManager } from "../utils/websocket-manager"
import { IBuildContext } from "./"
import {
  markWebpackStatusAsPending,
  markWebpackStatusAsDone,
} from "../utils/webpack-status"
import { emitter } from "../redux"

export async function startWebpackServer({
  program,
  app,
  workerPool,
  store,
}: Partial<IBuildContext>): Promise<{
  compiler: Compiler
  websocketManager: WebsocketManager
  webpackWatching: WebpackWatching
}> {
  if (!program || !app || !store) {
    report.panic(`Missing required params`)
  }
  let { compiler, webpackActivity, websocketManager, webpackWatching } =
    await startServer(program, app, workerPool)

  compiler.hooks.invalid.tap(`log compiling`, function () {
    if (!webpackActivity) {
      // mark webpack as pending if we are not in the middle of compilation already
      // when input is invalidated during compilation, webpack will automatically
      // run another compilation round before triggering `done` event
      report.pendingActivity({ id: `webpack-develop` })
      markWebpackStatusAsPending()
    }
  })

  compiler.hooks.watchRun.tapAsync(`log compiling`, function (_, done) {
    if (!webpackActivity) {
      // there can be multiple `watchRun` events before receiving single `done` event
      // webpack will not emit assets or `done` event until all pending invalidated
      // inputs were compiled
      webpackActivity = report.activityTimer(`Re-building development bundle`, {
        id: `webpack-develop`,
      })
      webpackActivity.start()
    }

    done()
  })

  let isFirstCompile = true

  return new Promise(resolve => {
    compiler.hooks.done.tapAsync(
      `print gatsby instructions`,
      async function (stats, done) {
        if (isFirstCompile) {
          webpackWatching.suspend()
        }

        const urls = prepareUrls(
          program.https ? `https` : `http`,
          program.host,
          program.port
        )
        const isSuccessful = !stats.hasErrors()

        if (isSuccessful && isFirstCompile) {
          // Show notices to users about potential experiments/feature flags they could
          // try.
          showExperimentNotices()
          printInstructions(
            program.sitePackageJson.name || `(Unnamed package)`,
            urls
          )

          if (program.open) {
            try {
              await openurl(urls.localUrlForBrowser)
            } catch {
              console.log(
                `${chalk.yellow(
                  `warn`
                )} Browser not opened because no browser was found`
              )
            }
          }
        }

        isFirstCompile = false

        if (webpackActivity) {
          if (stats.hasWarnings()) {
            const rawMessages = stats.toJson({ all: false, warnings: true })
            reportWebpackWarnings(rawMessages.warnings, report)
          }

          if (!isSuccessful) {
            const errors = structureWebpackErrors(
              Stage.Develop,
              stats.compilation.errors
            )
            webpackActivity.panicOnBuild(errors)
          }
          webpackActivity.end()
          webpackActivity = null
        }

        markWebpackStatusAsDone()
        done()
        emitter.emit(`COMPILATION_DONE`, stats)
        resolve({ compiler, websocketManager, webpackWatching })
      }
    )
  })
}
