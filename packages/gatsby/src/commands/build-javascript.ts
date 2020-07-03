import { Span } from "opentracing"
import webpack from "webpack"
import { isEqual } from "lodash"
import flatMap from "lodash/flatMap"

import webpackConfig from "../utils/webpack.config"
import { store } from "../redux"
import { mapTemplatesToStaticQueryHashes } from "../utils/map-pages-to-static-query-hashes"

import { IProgram } from "./types"

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
    const compiler = webpack(compilerConfig)

    compiler.hooks.compilation.tap(`webpack-dep-tree-plugin`, compilation => {
      compilation.hooks.seal.tap(`webpack-dep-tree-plugin`, () => {
        const state = store.getState()
        const mapOfTemplatesToStaticQueryHashes = mapTemplatesToStaticQueryHashes(
          state,
          compilation
        )

        mapOfTemplatesToStaticQueryHashes.forEach(
          (staticQueryHashes, componentPath) => {
            if (
              !isEqual(
                state.staticQueriesByTemplate.get(componentPath),
                staticQueryHashes.map(String)
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
      })
    })

    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }

      reportWebpackWarnings(stats)

      if (stats.hasErrors()) {
        const flattenStatsErrors = (stats: webpack.Stats): Error[] => [
          ...stats.compilation.errors,
          ...flatMap(stats.compilation.children, child =>
            flattenStatsErrors(child.getStats())
          ),
        ]
        return reject(flattenStatsErrors(stats))
      }

      return resolve(stats)
    })
  })
}
