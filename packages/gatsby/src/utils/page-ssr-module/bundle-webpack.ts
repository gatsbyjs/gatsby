import * as path from "path"
import webpack from "webpack"
import Parcel from "@parcel/core"
import { OutputFormat  } from "@parcel/types"
import mod from "module"
import { WebpackLoggingPlugin } from "../../utils/webpack/plugins/webpack-logging"
import reporter from "gatsby-cli/lib/reporter"
import type { ITemplateDetails } from "./entry"
import { getParcelFile, createParcelConfig } from "../parcel"
import fs from "fs"

import {
  getScriptsAndStylesForTemplate,
  readWebpackStats,
} from "../client-assets-for-template"
import { writeStaticQueryContext } from "../static-query-utils"
import { IGatsbyState } from "../../redux/types"
import { getAbsolutePathForVirtualModule } from "../gatsby-webpack-virtual-modules"

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

interface ICreatePageSSRBundle {
  rootDir: string
  components: IGatsbyState["components"]
  staticQueriesByTemplate: IGatsbyState["staticQueriesByTemplate"]
  webpackCompilationHash: IGatsbyState["webpackCompilationHash"]
  reporter: Reporter
  isVerbose?: boolean
}

export async function createPageSSRBundle(args: ICreatePageSSRBundle): Promise<webpack.Compilation | undefined> {
  return process.env.GATSBY_EXPERIMENTAL_BUNDLER ? bundleSSR(args) : webpackSSR(args)
}

async function bundleSSR({
  // rootDir,
  // components,
  // staticQueriesByTemplate,
  // webpackCompilationHash,
  // reporter,
  // isVerbose = false,
}: ICreatePageSSRBundle): Promise<webpack.Compilation | undefined> {


  // const toInline: Record<string, ITemplateDetails> = {}
  // for (const pageTemplate of components.values()) {
  //   const staticQueryHashes =
  //     staticQueriesByTemplate.get(pageTemplate.componentPath) || []

  //   toInline[pageTemplate.componentChunkName] = {
  //     query: pageTemplate.query,
  //     staticQueryHashes,
  //     assets: await getScriptsAndStylesForTemplate(
  //       pageTemplate.componentChunkName,
  //       webpackStats
  //     ),
  //   }
  // }
  // TODO actually generate this
  const toInline = JSON.parse(fs.readFileSync(getParcelFile("toInline.json")).toString())

  fs.writeFileSync(
    path.join(`public`, `parcel.toInline.json`),
    JSON.stringify(toInline)
  )
  
  const entry = path.join(__dirname, `entry.js`)

  const config = createParcelConfig(
    'page-ssr', 
    {
      resolvers: ["parcel-resolver-externals", "parcel-resolver-aliases"],
    },
    {
      externals: [
        'routes/render-page',
      ],
      aliases: {
        ".cache": path.join(process.cwd(), `.cache`),
        $virtual: getAbsolutePathForVirtualModule(`$virtual`)
      }
    }
  )

  const options = {
    config: config.rc,
    cacheDir: config.cache,
    entries: entry,
    outDir: outputDir,
    outFile: 'index.js',
    watch: false,
    // cache: true,
    contentHash: false,
    global: 'moduleName',
    minify: false,
    scopeHoist: false,
    target: 'commonjs',
    bundleNodeModules: false,
    // logLevel: "warn",
    hmr: false,
    hmrPort: 0,
    sourceMaps: false,
    autoInstall: false,
    targets: {
      root: {
        outputFormat: `commonjs` as OutputFormat,
        includeNodeModules: false,
        sourceMap: false,
        engines: {
          node: `>= 14.15.0`,
        },
        distDir: outputDir,
      },
    },
  }

  const bundler = new Parcel(options)
  const result = await bundler.run()
  return undefined

  // return new Promise(async (resolve, reject) => {
  //   // try {
  //   //   const bundler = new Parcel(options)
  //   // } catch (e) {
  //   //   console.log(e)
  //   // }

  //   try {
  //     const bundler = new Parcel(options)
  //     const result = await bundler.run()
  //     resolve(undefined)

  //     // await bundler.watch((error, buildEvent) => {
  //     //   if (buildEvent?.type === "buildSuccess") {
  //     //     return resolve(undefined)
  //     //   }
  //     //   if (buildEvent?.type === "buildFailure") {
  //     //     // TODO format this better, use codeframes
  //     //     reject(buildEvent?.diagnostics.map(d => `${d.origin}: ${d.message}\n  ${d.hints?.join('\n  ')}\n  ${d.codeFrames && JSON.stringify(d.codeFrames)}`).join('\n') || error)
  //     //   }
  //     // })
  //   } catch (e) {
  //     reject(e?.diagnostics.map(d => `${d.origin}: ${d.message}\n  ${d.hints?.join('\n  ')}\n  ${d.codeFrames && JSON.stringify(d.codeFrames)}`).join('\n') || e)
  //   }
  // })
}

async function webpackSSR({
  rootDir,
  components,
  staticQueriesByTemplate,
  webpackCompilationHash,
  reporter,
  isVerbose = false,
}: ICreatePageSSRBundle): Promise<webpack.Compilation | undefined> {
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

  fs.writeFileSync("/home/josh/toInline.json", JSON.stringify(toInline))

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
