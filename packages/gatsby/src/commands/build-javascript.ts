import { Span } from "opentracing"
import webpack, { WebpackError } from "webpack"
import webpackConfig from "../utils/webpack.config"
import { IProgram } from "./types"
import reporter from "gatsby-cli/lib/reporter"
import {
  showExperimentNoticeAfterTimeout,
  CancelExperimentNoticeCallbackOrUndefined,
} from "../utils/show-experiment-notice"

export const buildProductionBundle = async (
  program: IProgram,
  parentSpan: Span
): Promise<{
  stats: webpack.Stats | Error | Array<WebpackError>
  waitForCompilerClose: Promise<void>
}> => {
  const { directory } = program

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`,
    null,
    { parentSpan }
  )

  return new Promise((resolve, reject) => {
    const compiler = webpack(compilerConfig)

    const THIRTY_SECONDS = 30 * 1000
    let cancelCacheNotice: CancelExperimentNoticeCallbackOrUndefined
    if (
      process.env.gatsby_executing_command === `build` &&
      !process.env.GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE
    ) {
      cancelCacheNotice = showExperimentNoticeAfterTimeout(
        `Persistent webpack caching`,
        `https://github.com/gatsbyjs/gatsby/discussions/28331`,
        `which enables webpack's persist caching and changes Gatsby's cache clearing behavior to not clear webpack's
cache unless you run "gatsby clean" or delete the .cache folder manually.
Here's how to try it:

module.exports = {
  flags: { PRESERVE_WEBPACK_CACHE: true },
  plugins: [...]
}`,
        THIRTY_SECONDS
      )
    }

    compiler.run((err, stats) => {
      if (cancelCacheNotice) {
        cancelCacheNotice()
      }

      // stats can only be empty when an error occurs. Adding it to the if makes typescript happy.
      if (err || !stats) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(stats.compilation.errors)
      }

      let activity
      if (process.env.GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE) {
        activity = reporter.activityTimer(
          `Caching JavaScript and CSS webpack compilation`,
          { parentSpan }
        )
        activity.start()
      }

      const waitForCompilerClose = new Promise<void>((resolve, reject) => {
        compiler.close(error => {
          if (activity) {
            activity.end()
          }

          if (error) {
            return reject(error)
          }
          return resolve()
        })
      })

      return resolve({ stats, waitForCompilerClose })
    })
  })
}
