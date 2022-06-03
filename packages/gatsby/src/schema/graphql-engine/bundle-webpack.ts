/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path"
import * as fs from "fs-extra"
import webpack, { Module, NormalModule } from "webpack"
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule"
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

  const assetRelocatorUseEntry = {
    loader: require.resolve(`@vercel/webpack-asset-relocator-loader`),
    options: {
      outputAssetBase: `assets`,
    },
  }

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
          oneOf: [
            {
              // specific set of loaders for LMBD - our custom patch to massage lmdb to work with relocator -> relocator
              test: /node_modules[/\\]lmdb[/\\].*\.[cm]?js/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: [
                assetRelocatorUseEntry,
                {
                  loader: require.resolve(`./lmdb-bundling-patch`),
                },
              ],
            },
            {
              // specific set of loaders for gatsby-node files - our babel transform that removes lifecycles not needed for engine -> relocator
              test: /gatsby-node\.([cm]?js)$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: [
                assetRelocatorUseEntry,
                {
                  loader: require.resolve(`./webpack-remove-apis-loader`),
                },
              ],
            },
            {
              // generic loader for all other cases than lmdb or gatsby-node - we don't do anything special other than using relocator on it
              // For node binary relocations, include ".node" files as well here
              test: /\.([cm]?js|node)$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: assetRelocatorUseEntry,
            },
          ],
        },
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
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: `babel-loader`,
            options: {
              presets: [`@babel/preset-typescript`],
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
        // only load one version of lmdb
        lmdb: require.resolve(`lmdb`),
        "ts-node": require.resolve(`./shims/ts-node`),
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
      function getResourcePath(
        webpackModule: Module | NormalModule | ConcatenatedModule
      ): string | undefined {
        if (!(webpackModule instanceof ConcatenatedModule)) {
          return (webpackModule as NormalModule).resource
        }

        // ConcatenatedModule is a collection of modules so we have to go deeper to actually get it
        return webpackModule.modules.some(
          innerModule => (innerModule as NormalModule).resource
        )
      }

      let tsNodeUsed = false
      stats?.compilation.modules.forEach(webpackModule => {
        if (
          !tsNodeUsed &&
          getResourcePath(webpackModule)?.includes(`ts-node`)
        ) {
          // console.log(webpackModule)
          const importedBy = getResourcePath(
            stats.compilation.moduleGraph.getIssuer(webpackModule)
          )
          console.warn(
            `"ts-node" usage detected${
              importedBy ? ` (imported by ${importedBy})` : ``
            }`
          )
          tsNodeUsed = true
        }
      })

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
