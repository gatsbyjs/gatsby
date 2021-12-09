/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path"
import * as fs from "fs-extra"
import webpack from "webpack"
import { printQueryEnginePlugins } from "./print-plugins"
import mod from "module"
import { WebpackLoggingPlugin } from "../../utils/webpack/plugins/webpack-logging"
import reporter from "gatsby-cli/lib/reporter"

type Reporter = typeof reporter

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

const outputDir = path.join(process.cwd(), `.cache`, `query-engine`)
const cacheLocation = path.join(
  process.cwd(),
  `.cache`,
  `webpack`,
  `query-engine`
)

export async function createGraphqlEngineBundle(
  rootDir: string,
  reporter: Reporter,
  isVerbose?: boolean
): Promise<webpack.Compilation | undefined> {
  const schemaSnapshotString = await fs.readFile(
    path.join(rootDir, `.cache`, `schema.gql`),
    `utf-8`
  )
  await printQueryEnginePlugins()

  const compiler = webpack({
    name: `Query Engine`,
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
      node: false,
    },
    cache: {
      type: `filesystem`,
      name: `graphql-engine`,
      cacheLocation,
      buildDependencies: {
        config: [__filename],
      },
    },
    // those are required in some runtime paths, but we don't need them
    externals: [
      `cbor-x`, // optional dep of lmdb-store, but we are using `msgpack` (default) encoding, so we don't need it
      `babel-runtime/helpers/asyncToGenerator`, // undeclared dep of yurnalist (but used in code path we don't use)
      `electron`, // :shrug: `got` seems to have electron specific code path
      mod.builtinModules.reduce((acc, builtinModule) => {
        if (builtinModule === `fs`) {
          acc[builtinModule] = `global _actualFsWrapper`
        } else {
          acc[builtinModule] = `commonjs ${builtinModule}`
        }

        return acc
      }, {}),
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
          type: `asset/resource`,
        },
      ],
    },
    resolve: {
      extensions,
      alias: {
        ".cache": process.cwd() + `/.cache/`,

        [require.resolve(`gatsby-cli/lib/reporter/loggers/ink/index.js`)]:
          false,
        inquirer: false,
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        // "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
        "process.env.GATSBY_EXPERIMENTAL_LMDB_STORE": `true`,
        "process.env.GATSBY_SKIP_WRITING_SCHEMA_TO_FILE": `true`,
        SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
        "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
      }),
      process.env.GATSBY_WEBPACK_LOGGING?.includes(`query-engine`) &&
        new WebpackLoggingPlugin(rootDir, reporter, isVerbose),
    ].filter(Boolean) as Array<webpack.WebpackPluginInstance>,
  })

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      compiler.close(closeErr => {
        if (err) {
          return reject(err)
        }
        if (closeErr) {
          return reject(closeErr)
        }
        return resolve(stats?.compilation)
      })
    })
  })
}
