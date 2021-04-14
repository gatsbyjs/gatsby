import { Span } from "opentracing"
import webpack, { WebpackError } from "webpack"
import webpackConfig from "../utils/webpack.config"
import { IProgram } from "./types"

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

    compiler.run((err, stats) => {
      // stats can only be empty when an error occurs. Adding it to the if makes typescript happy.
      if (err || !stats) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(stats.compilation.errors)
      }

      const waitForCompilerClose = new Promise<void>((resolve, reject) => {
        compiler.close(error => {
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
