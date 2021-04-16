import { Span } from "opentracing"
import webpack, { WebpackError } from "webpack"
import webpackConfig from "../utils/webpack.config"
import { IProgram } from "./types"

export const buildProductionBundle = async (
  program: IProgram,
  parentSpan: Span
): Promise<webpack.Stats | Error | Array<WebpackError>> => {
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

    compiler.run((err, stats) => {
      // stats can only be empty when an error occurs. Adding it to the if makes typescript happy.
      if (err || !stats) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(stats.compilation.errors)
      }

      return resolve(stats)
    })
  })
}
