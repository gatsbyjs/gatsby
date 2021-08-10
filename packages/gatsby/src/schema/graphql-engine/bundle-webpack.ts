/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path"
import * as fs from "fs-extra"
import webpack from "webpack"
import { printQueryEnginePlugins } from "./print-plugins"

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

const outputDir = path.join(process.cwd(), `.cache`, `query-engine`)

export async function createGraphqlEngineBundle(): Promise<any> {
  const schemaSnapshotString = await fs.readFile(
    process.cwd() + `/.cache/schema.gql`,
    `utf-8`
  )
  await printQueryEnginePlugins()

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
      `cbor-x`, // optional dep of lmdb-store, but we are using `msgpack` (default) encoding, so we don't need it
      `babel-runtime/helpers/asyncToGenerator`, // undeclared dep of yurnalist (but used in code path we don't use)
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
        // "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
        "process.env.GATSBY_EXPERIMENTAL_LMDB_STORE": `true`,
        "process.env.GATSBY_SKIP_WRITING_SCHEMA_TO_FILE": `true`,
        SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
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
