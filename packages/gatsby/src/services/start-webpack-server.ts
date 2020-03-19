import openurl from "better-opn"
import report from "gatsby-cli/lib/reporter"
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages"
import chalk from "chalk"

import {
  reportWebpackWarnings,
  structureWebpackErrors,
} from "../utils/webpack-error-utils"

import { printDeprecationWarnings } from "../utils/print-deprecation-warnings"
import { printInstructions } from "../utils/print-instructions"
import { prepareUrls } from "../utils/prepare-urls"
import { startServer } from "../utils/start-server"

export async function startWebpackServer({ program }): Promise<any> {
  let { compiler, webpackActivity } = await startServer(program)

  compiler.hooks.watchRun.tapAsync(`log compiling`, function(_, done) {
    if (webpackActivity) {
      webpackActivity.end()
    }
    webpackActivity = report.activityTimer(`Re-building development bundle`, {
      id: `webpack-develop`,
    })
    webpackActivity.start()

    done()
  })

  let isFirstCompile = true
  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tapAsync(`print gatsby instructions`, function(
    stats,
    done
  ) {
    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const urls = prepareUrls(
      program.ssl ? `https` : `http`,
      program.host,
      program.port
    )
    const isSuccessful = !messages.errors.length

    if (isSuccessful && isFirstCompile) {
      printInstructions(
        program.sitePackageJson.name || `(Unnamed package)`,
        urls
      )
      printDeprecationWarnings()
      if (program.open) {
        Promise.resolve(openurl(urls.localUrlForBrowser)).catch(() =>
          console.log(
            `${chalk.yellow(
              `warn`
            )} Browser not opened because no browser was found`
          )
        )
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

    done()
  })
  return {
    compiler,
  }
}
