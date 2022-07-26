import * as path from "path"
import webpack from "webpack"
import mod from "module"
import { WebpackLoggingPlugin } from "../../utils/webpack/plugins/webpack-logging"
import reporter from "gatsby-cli/lib/reporter"
import type { ITemplateDetails } from "./entry"

import {
  getScriptsAndStylesForTemplate,
  readWebpackStats,
} from "../client-assets-for-template"
import { writeStaticQueryContext } from "../static-query-utils"
import { IGatsbyState } from "../../redux/types"

type Reporter = typeof reporter

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]
const outputDir = path.join(process.cwd(), `.cache`, `page-ssr`)
const cacheLocation = path.join(process.cwd(), `.cache`, `webpack`, `page-ssr`)

export async function writeQueryContext({
  staticQueriesByTemplate,
  components,
}: {
  staticQueriesByTemplate: IGatsbyState["staticQueriesByTemplate"]
  components: IGatsbyState["components"]
}): Promise<void> {
  const waitingForWrites: Array<Promise<unknown>> = []
  for (const pageTemplate of components.values()) {
    const staticQueryHashes =
      staticQueriesByTemplate.get(pageTemplate.componentPath) || []

    waitingForWrites.push(
      writeStaticQueryContext(
        staticQueryHashes,
        pageTemplate.componentChunkName
      )
    )
  }

  return Promise.all(waitingForWrites).then(() => {})
}

export async function createPageSSRBundle({
  rootDir,
  components,
  staticQueriesByTemplate,
  webpackCompilationHash,
  reporter,
  isVerbose = false,
}: {
  rootDir: string
  components: IGatsbyState["components"]
  staticQueriesByTemplate: IGatsbyState["staticQueriesByTemplate"]
  webpackCompilationHash: IGatsbyState["webpackCompilationHash"]
  reporter: Reporter
  isVerbose?: boolean
}): Promise<webpack.Compilation | undefined> {
  const webpackStats = await readWebpackStats(path.join(rootDir, `public`))

  const toInline: Record<string, ITemplateDetails> = {}
  for (const pageTemplate of components.values()) {
    const staticQueryHashes =
      staticQueriesByTemplate.get(pageTemplate.componentPath) || []

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
    name: `Page Engine`,
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
      name: `page-ssr`,
      cacheLocation,
      buildDependencies: {
        config: [__filename],
      },
    },
    // those are required in some runtime paths, but we don't need them
    externals: [
      /^\.\/routes/,
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
    devtool: false,
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
        ".cache": `${rootDir}/.cache/`,
        [require.resolve(`gatsby-cli/lib/reporter/loggers/ink/index.js`)]:
          false,
        inquirer: false,
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        INLINED_TEMPLATE_TO_DETAILS: JSON.stringify(toInline),
        WEBPACK_COMPILATION_HASH: JSON.stringify(webpackCompilationHash),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
      }),
      process.env.GATSBY_WEBPACK_LOGGING?.includes(`page-engine`)
        ? new WebpackLoggingPlugin(rootDir, reporter, isVerbose)
        : false,
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
