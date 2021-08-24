import * as path from "path"
import { store } from "../../redux"
import webpack from "webpack"

import type { ITemplateDetails } from "./entry"

import {
  getScriptsAndStylesForTemplate,
  readWebpackStats,
} from "../client-assets-for-template"
import { writeStaticQueryContext } from "../static-query-utils"

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]
const outputDir = path.join(process.cwd(), `.cache`, `page-ssr`)

export async function createPageSSRBundle(): Promise<void> {
  const { program, components } = store.getState()
  const webpackStats = await readWebpackStats(
    path.join(program.directory, `public`)
  )

  const toInline: Record<string, ITemplateDetails> = {}
  for (const pageTemplate of components.values()) {
    const staticQueryHashes =
      store
        .getState()
        .staticQueriesByTemplate.get(pageTemplate.componentPath) || []
    await writeStaticQueryContext(
      staticQueryHashes,
      pageTemplate.componentChunkName
    )

    toInline[pageTemplate.componentChunkName] = {
      query: pageTemplate.query,
      staticQueryHashes,
      assets: await getScriptsAndStylesForTemplate(
        pageTemplate.componentChunkName,
        webpackStats
      ),
    }
  }
  const compiler = webpack({
    // mode: `production`,
    mode: `none`,
    entry: path.join(__dirname, `entry.js`),
    output: {
      path: outputDir,
      filename: `index.js`,
      libraryTarget: `commonjs`,
    },
    target: `node`,
    externalsPresets: {
      node: true,
    },
    // those are required in some runtime paths, but we don't need them
    externals: [
      `./render-page`,
      // `cbor-x`, // optional dep of lmdb-store, but we are using `msgpack` (default) encoding, so we don't need it
      // `babel-runtime/helpers/asyncToGenerator`, // undeclared dep of yurnalist (but used in code path we don't use)
      `electron`, // :shrug: `got` seems to have electron specific code path
    ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          type: `javascript/auto`,
          resolve: {
            byDependency: {
              esm: {
                fullySpecified: false,
              },
            },
          },
        },
        {
          // For node binary relocations, include ".node" files as well here
          test: /\.(m?js|node)$/,
          // it is recommended for Node builds to turn off AMD support
          parser: { amd: false },
          use: {
            loader: require.resolve(`@vercel/webpack-asset-relocator-loader`),
            options: {
              outputAssetBase: `assets`,
            },
          },
        },
        {
          test: /\.txt/,
          use: [
            {
              loader: require.resolve(`file-loader`),
            },
          ],
        },
      ],
    },
    resolve: {
      extensions,
      alias: {
        ".cache": process.cwd() + `/.cache/`,
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        INLINED_TEMPLATE_TO_DETAILS: JSON.stringify(toInline),
      }),
    ],
  })

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(stats?.compilation)
      }
    })
  })
}
