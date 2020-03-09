import webpack from "webpack"
import webpackConfig from "../utils/webpack.config"
import { IProgram } from "./types"
import { Span } from "opentracing"

import { reportWebpackWarnings } from "../utils/webpack-error-utils"

export const buildProductionBundle = async (
  program: IProgram,
  parentSpan: Span
): Promise<webpack.Stats> => {
  const { directory } = program

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`,
    null,
    { parentSpan }
  )

  return new Promise((resolve, reject) => {
    webpack(compilerConfig).run((err, stats) => {
      if (err) {
        reject(err)
        return
      }

      reportWebpackWarnings(stats)

      if (stats.hasErrors()) {
        reject(stats.compilation.errors)
        return
      }

      resolve(stats)
    })
  })
}
