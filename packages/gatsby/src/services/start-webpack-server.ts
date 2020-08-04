import openurl from "better-opn"
import report from "gatsby-cli/lib/reporter"
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages"
import chalk from "chalk"
import { Compiler } from "webpack"
import { isEqual } from "lodash"

import {
  reportWebpackWarnings,
  structureWebpackErrors,
} from "../utils/webpack-error-utils"

import { printDeprecationWarnings } from "../utils/print-deprecation-warnings"
import { printInstructions } from "../utils/print-instructions"
import { prepareUrls } from "../utils/prepare-urls"
import { startServer, IWebpackWatchingPauseResume } from "../utils/start-server"
import { WebsocketManager } from "../utils/websocket-manager"
import { IBuildContext } from "./"
import {
  markWebpackStatusAsPending,
  markWebpackStatusAsDone,
} from "../utils/webpack-status"
import { enqueueFlush } from "../utils/page-data"
import mapTemplatesToStaticQueryHashes from "../utils/map-templates-to-static-query-hashes"
import { emitter } from "../redux"

export async function startWebpackServer({
  program,
  app,
  workerPool,
  store,
}: Partial<IBuildContext>): Promise<{
  compiler: Compiler
  websocketManager: WebsocketManager
  webpackWatching: IWebpackWatchingPauseResume
}> {
  if (!program || !app || !store) {
    report.panic(`Missing required params`)
  }
  let {
    compiler,
    webpackActivity,
    websocketManager,
    webpackWatching,
  } = await startServer(program, app, workerPool)
  webpackWatching.suspend()

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
    compiler.hooks.done.tapAsync(`print gatsby instructions`, async function (
      stats,
      done
    ) {
      // "done" event fires when Webpack has finished recompiling the bundle.
      // Whether or not you have warnings or errors, you will get this event.

      // We have switched off the default Webpack output in WebpackDevServer
      // options so we are going to "massage" the warnings and errors and present
      // them in a readable focused way.
      const messages = formatWebpackMessages(stats.toJson({}, true))
      const urls = prepareUrls(
        program.https ? `https` : `http`,
        program.host,
        program.proxyPort
      )
      const isSuccessful = !messages.errors.length

      if (isSuccessful && isFirstCompile) {
        printInstructions(
          program.sitePackageJson.name || `(Unnamed package)`,
          urls
        )
        printDeprecationWarnings()
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

      if (isSuccessful) {
        const state = store.getState()
        const mapOfTemplatesToStaticQueryHashes = mapTemplatesToStaticQueryHashes(
          state,
          stats.compilation
        )

        mapOfTemplatesToStaticQueryHashes.forEach(
          (staticQueryHashes, componentPath) => {
            if (
              !isEqual(
                state.staticQueriesByTemplate.get(componentPath) || [],
                staticQueryHashes
              )
            ) {
              store.dispatch({
                type: `ADD_PENDING_TEMPLATE_DATA_WRITE`,
                payload: {
                  componentPath,
                },
              })
              store.dispatch({
                type: `SET_STATIC_QUERIES_BY_TEMPLATE`,
                payload: {
                  componentPath,
                  staticQueryHashes,
                },
              })
            }
          }
        )

        enqueueFlush()
      }

      markWebpackStatusAsDone()
      done()
      emitter.emit(`COMPILATION_DONE`, stats)
      resolve({ compiler, websocketManager, webpackWatching })
    })
  })
}
