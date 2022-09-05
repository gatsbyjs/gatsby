/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path"
import * as fs from "fs-extra"
import webpack, { Module, NormalModule, Compilation } from "webpack"
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule"
import { printQueryEnginePlugins } from "./print-plugins"
import mod from "module"
import { WebpackLoggingPlugin } from "../../utils/webpack/plugins/webpack-logging"
import reporter from "gatsby-cli/lib/reporter"
import { schemaCustomizationAPIs } from "./print-plugins"
import type { GatsbyNodeAPI } from "../../redux/types"
import * as nodeApis from "../../utils/api-node-docs"

type Reporter = typeof reporter

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

const outputDir = path.join(process.cwd(), `.cache`, `query-engine`)
const cacheLocation = path.join(
  process.cwd(),
  `.cache`,
  `webpack`,
  `query-engine`
)

function getApisToRemoveForQueryEngine(): Array<GatsbyNodeAPI> {
  const apisToKeep = new Set(schemaCustomizationAPIs)
  apisToKeep.add(`onPluginInit`)

  const apisToRemove = (Object.keys(nodeApis) as Array<GatsbyNodeAPI>).filter(
    api => !apisToKeep.has(api)
  )
  return apisToRemove
}

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

  const gatsbyPluginTSRequire = mod.createRequire(
    require.resolve(`gatsby-plugin-typescript`)
  )

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
          acc[`node:${builtinModule}`] = `global _actualFsWrapper`
        } else {
          acc[builtinModule] = `commonjs ${builtinModule}`
          acc[`node:${builtinModule}`] = `commonjs ${builtinModule}`
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
              test: /gatsby-node\.(cjs|mjs|js|ts)$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: [
                assetRelocatorUseEntry,
                {
                  loader: require.resolve(
                    `../../utils/webpack/loaders/webpack-remove-exports-loader`
                  ),
                  options: {
                    remove: getApisToRemoveForQueryEngine(),
                    jsx: false,
                  },
                },
              ],
            },
            {
              // generic loader for all other cases than lmdb or gatsby-node - we don't do anything special other than using relocator on it
              // For node binary relocations, include ".node" files as well here
              test: /\.(cjs|mjs|js|ts|node)$/,
              // it is recommended for Node builds to turn off AMD support
              parser: { amd: false },
              use: assetRelocatorUseEntry,
            },
          ],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: require.resolve(`babel-loader`),
            options: {
              presets: [
                gatsbyPluginTSRequire.resolve(`@babel/preset-typescript`),
              ],
            },
          },
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
      new webpack.EnvironmentPlugin([`GATSBY_CLOUD_IMAGE_CDN`]),
      new webpack.DefinePlugin({
        // "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
        "process.env.GATSBY_EXPERIMENTAL_LMDB_STORE": `true`,
        "process.env.GATSBY_SKIP_WRITING_SCHEMA_TO_FILE": `true`,
        "process.env.NODE_ENV": JSON.stringify(`production`),
        SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
        "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
      }),
      process.env.GATSBY_WEBPACK_LOGGING?.includes(`query-engine`) &&
        new WebpackLoggingPlugin(rootDir, reporter, isVerbose),
    ].filter(Boolean) as Array<webpack.WebpackPluginInstance>,
  })

  return new Promise((resolve, reject) => {
    compiler.run((err, stats): void => {
      function getResourcePath(
        webpackModule?: Module | NormalModule | ConcatenatedModule | null
      ): string | undefined {
        if (webpackModule && !(webpackModule instanceof ConcatenatedModule)) {
          return (webpackModule as NormalModule).resource
        }

        if (webpackModule?.modules) {
          // ConcatenatedModule is a collection of modules so we have to go deeper to actually get a path,
          // at this point we won't know which one so we just grab first module here
          const [firstSubModule] = webpackModule.modules
          return getResourcePath(firstSubModule)
        }

        return undefined
      }

      function iterateModules(
        webpackModules: Set<Module>,
        compilation: Compilation
      ): void {
        for (const webpackModule of webpackModules) {
          if (webpackModule instanceof ConcatenatedModule) {
            iterateModules(
              (webpackModule as ConcatenatedModule).modules,
              compilation
            )
          } else {
            const resourcePath = getResourcePath(webpackModule)
            if (resourcePath?.includes(`ts-node`)) {
              const importedBy = getResourcePath(
                compilation.moduleGraph.getIssuer(webpackModule)
              )
              const structuredError = {
                id: `98011`,
                context: {
                  package: `ts-node`,
                  importedBy,
                  advisory: `Gatsby is supporting TypeScript natively (see https://gatsby.dev/typescript). "ts-node" might not be needed anymore at all, consider removing it.`,
                },
              }
              throw structuredError
            }
          }
        }
      }

      try {
        if (stats?.compilation.modules) {
          iterateModules(stats.compilation.modules, stats.compilation)
        }

        compiler.close(closeErr => {
          if (err) {
            return reject(err)
          }
          if (closeErr) {
            return reject(closeErr)
          }
          return resolve(stats?.compilation)
        })
      } catch (e) {
        reject(e)
      }
    })
  })
}
