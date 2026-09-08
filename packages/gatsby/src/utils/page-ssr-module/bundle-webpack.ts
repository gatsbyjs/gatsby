import * as path from "path"
import * as fs from "fs-extra"
import webpack from "webpack"
import mod from "module"
import { WebpackLoggingPlugin } from "../../utils/webpack/plugins/webpack-logging"
import reporter from "gatsby-cli/lib/reporter"
import type { EnginePage, ITemplateDetails } from "./entry"

import {
  getScriptsAndStylesForTemplate,
  readWebpackStats,
} from "../client-assets-for-template"
import { IGatsbyState } from "../../redux/types"
import { store } from "../../redux"
import { getLmdbOnCdnPath, shouldBundleDatastore } from "../engines-helpers"
import { getPageMode } from "../page-mode"

type Reporter = typeof reporter

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]
const outputDir = path.join(process.cwd(), `.cache`, `page-ssr`)
const cacheLocation = path.join(process.cwd(), `.cache`, `webpack`, `page-ssr`)

export async function copyStaticQueriesToEngine({
  engineTemplatePaths,
  components,
  staticQueriesByTemplate,
}: {
  engineTemplatePaths: Set<string>
  components: IGatsbyState["components"]
  staticQueriesByTemplate: IGatsbyState["staticQueriesByTemplate"]
}): Promise<void> {
  const staticQueriesToCopy = new Set<string>()

  for (const component of components.values()) {
    // figuring out needed slices for each pages using componentPath is not straightforward
    // so for now we just collect static queries for all slices + engine templates
    if (component.isSlice || engineTemplatePaths.has(component.componentPath)) {
      const staticQueryHashes =
        staticQueriesByTemplate.get(component.componentPath) || []

      for (const hash of staticQueryHashes) {
        staticQueriesToCopy.add(hash)
      }
    }
  }

  const sourceDir = path.join(process.cwd(), `public`, `page-data`, `sq`, `d`)
  const destDir = path.join(outputDir, `sq`)

  await fs.ensureDir(destDir)
  await fs.emptyDir(destDir)

  const promisesToAwait: Array<Promise<void>> = []
  for (const hash of staticQueriesToCopy) {
    const sourcePath = path.join(sourceDir, `${hash}.json`)
    const destPath = path.join(destDir, `${hash}.json`)

    promisesToAwait.push(fs.copy(sourcePath, destPath))
  }

  await Promise.all(promisesToAwait)
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
  const state = store.getState()
  const pathPrefix = state.program.prefixPaths
    ? state.config.pathPrefix ?? ``
    : ``
  const slicesStateObject = {}
  for (const [key, value] of state.slices) {
    slicesStateObject[key] = value
  }

  const slicesByTemplateStateObject = {}
  for (const [template, records] of state.slicesByTemplate) {
    const recordsObject = {}
    for (const path of Object.keys(records)) {
      recordsObject[path] = records[path]
    }

    slicesByTemplateStateObject[template] = recordsObject
  }

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

  const pagesIterable: Array<[string, EnginePage]> = []
  for (const [pagePath, page] of state.pages) {
    const mode = getPageMode(page, state)
    if (mode !== `SSG`) {
      pagesIterable.push([
        pagePath,
        {
          componentChunkName: page.componentChunkName,
          componentPath: page.componentPath,
          context: page.context,
          matchPath: page.matchPath,
          mode,
          path: page.path,
          slices: page.slices,
        },
      ])
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
        INLINED_HEADERS_CONFIG: JSON.stringify(state.config.headers),
        WEBPACK_COMPILATION_HASH: JSON.stringify(webpackCompilationHash),
        GATSBY_PAGES: JSON.stringify(pagesIterable),
        GATSBY_SLICES: JSON.stringify(slicesStateObject),
        GATSBY_SLICES_BY_TEMPLATE: JSON.stringify(slicesByTemplateStateObject),
        GATSBY_SLICES_SCRIPT: JSON.stringify(
          _CFLAGS_.GATSBY_MAJOR === `5` && process.env.GATSBY_SLICES
            ? fs.readFileSync(
                path.join(
                  rootDir,
                  `public`,
                  `_gatsby`,
                  `slices`,
                  `_gatsby-scripts-1.html`
                ),
                `utf-8`
              )
            : ``
        ),
        PATH_PREFIX: JSON.stringify(pathPrefix),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "process.env.GATSBY_SLICES": JSON.stringify(
          !!process.env.GATSBY_SLICES
        ),
      }),
      process.env.GATSBY_WEBPACK_LOGGING?.includes(`page-engine`)
        ? new WebpackLoggingPlugin(rootDir, reporter, isVerbose)
        : false,
    ].filter(Boolean) as Array<webpack.WebpackPluginInstance>,
  })

  let IMAGE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH = ``
  if (global.__GATSBY?.imageCDNUrlGeneratorModulePath) {
    await fs.copyFile(
      global.__GATSBY.imageCDNUrlGeneratorModulePath,
      path.join(outputDir, `image-cdn-url-generator.js`)
    )
    IMAGE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH = `./image-cdn-url-generator.js`
  }

  let FILE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH = ``
  if (global.__GATSBY?.fileCDNUrlGeneratorModulePath) {
    await fs.copyFile(
      global.__GATSBY.fileCDNUrlGeneratorModulePath,
      path.join(outputDir, `file-cdn-url-generator.js`)
    )
    FILE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH = `./file-cdn-url-generator.js`
  }

  let functionCode = await fs.readFile(
    path.join(__dirname, `lambda.js`),
    `utf-8`
  )

  functionCode = functionCode
    .replaceAll(
      `%CDN_DATASTORE_PATH%`,
      shouldBundleDatastore() ? `` : getLmdbOnCdnPath()
    )
    .replaceAll(
      `%CDN_DATASTORE_ORIGIN%`,
      shouldBundleDatastore() ? `` : state.adapter.config.deployURL ?? ``
    )
    .replaceAll(`%PATH_PREFIX%`, pathPrefix)
    .replaceAll(
      `%IMAGE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH%`,
      IMAGE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH
    )
    .replaceAll(
      `%FILE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH%`,
      FILE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH
    )

  await fs.outputFile(path.join(outputDir, `lambda.js`), functionCode)

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
