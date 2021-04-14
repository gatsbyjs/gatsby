import { compile } from "joi"
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

    compiler.cache.hooks.storeBuildDependencies.tap(`a`, (...args) => {
      console.log(`storeBuildDependencies`)
    })

    compiler.cache.hooks.beginIdle.tap(`a`, (...args) => {
      console.log(`beginIdle`)
    })

    compiler.cache.hooks.endIdle.tap(`a`, (...args) => {
      console.log(`endIdle`)
    })

    // compiler.cache.hooks.get.tap(`a`, (...args) => {
    //   console.log(`get`)
    // })

    compiler.cache.hooks.shutdown.tap(`a`, (...args) => {
      console.log(`shutdown`)
    })

    compiler.hooks.done.tap(`a`, stats => {
      console.log(`done`)
    })

    // compiler.cache.hooks.store.tap(`a`, (...args) => {
    //   console.log(`store`)
    // })

    compiler.run((err, stats) => {
      // stats can only be empty when an error occurs. Adding it to the if makes typescript happy.
      if (err || !stats) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(stats.compilation.errors)
      }
      console.log(`compiler.run finished`)
      compiler.close((...args) => {
        console.log(`compiler close`, args)
      })
      return resolve(stats)
    })
  })
}
