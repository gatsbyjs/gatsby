import Bluebird from "bluebird"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import { getMatchPath } from "gatsby-core-utils"
import { createErrorFromString } from "gatsby-cli/lib/reporter/errors"
import { chunk, truncate } from "lodash"
import webpack, { Stats } from "webpack"
import * as path from "path"

import { emitter, store } from "../redux"
import { IGatsbyFunction } from "../redux/types"
import { IWebpackWatchingPauseResume } from "../utils/start-server"
import webpackConfig from "../utils/webpack.config"
import { structureWebpackErrors } from "../utils/webpack-error-utils"
import * as buildUtils from "./build-utils"
import { getPageData } from "../utils/get-page-data"

import { Span } from "opentracing"
import { IProgram, Stage } from "./types"
import { PackageJson } from "../.."
import type { GatsbyWorkerPool } from "../utils/worker/pool"
import { IPageDataWithQueryResult } from "../utils/page-data"

type IActivity = any // TODO

export interface IBuildArgs extends IProgram {
  directory: string
  sitePackageJson: PackageJson
  prefixPaths: boolean
  noUglify: boolean
  logPages: boolean
  writeToFile: boolean
  profile: boolean
  graphqlTracing: boolean
  openTracingConfigFile: string
  keepPageRenderer: boolean
}

let devssrWebpackCompiler: webpack.Compiler
let devssrWebpackWatcher: IWebpackWatchingPauseResume
let needToRecompileSSRBundle = true
export const getDevSSRWebpack = (): {
  devssrWebpackWatcher: IWebpackWatchingPauseResume
  devssrWebpackCompiler: webpack.Compiler
  needToRecompileSSRBundle: boolean
} => {
  if (process.env.gatsby_executing_command !== `develop`) {
    throw new Error(`This function can only be called in development`)
  }

  return {
    devssrWebpackWatcher,
    devssrWebpackCompiler,
    needToRecompileSSRBundle,
  }
}

let oldHash = ``
let newHash = ``
const runWebpack = (
  compilerConfig,
  stage: Stage,
  directory,
  parentSpan?: Span
): Bluebird<{
  stats: Stats
  waitForCompilerClose: Promise<void>
}> =>
  new Bluebird((resolve, reject) => {
    if (!process.env.GATSBY_EXPERIMENTAL_DEV_SSR || stage === `build-html`) {
      const compiler = webpack(compilerConfig)
      compiler.run((err, stats) => {
        let activity
        if (process.env.GATSBY_EXPERIMENTAL_PRESERVE_WEBPACK_CACHE) {
          activity = reporter.activityTimer(
            `Caching HTML renderer compilation`,
            { parentSpan }
          )
          activity.start()
        }

        const waitForCompilerClose = new Promise<void>((resolve, reject) => {
          compiler.close(error => {
            if (activity) {
              activity.end()
            }

            if (error) {
              return reject(error)
            }
            return resolve()
          })
        })

        if (err) {
          return reject(err)
        } else {
          return resolve({ stats: stats as Stats, waitForCompilerClose })
        }
      })
    } else if (
      process.env.GATSBY_EXPERIMENTAL_DEV_SSR &&
      stage === `develop-html`
    ) {
      devssrWebpackCompiler = webpack(compilerConfig)
      devssrWebpackCompiler.hooks.invalid.tap(`ssr file invalidation`, () => {
        needToRecompileSSRBundle = true
      })
      devssrWebpackWatcher = devssrWebpackCompiler.watch(
        {
          ignored: /node_modules/,
        },
        (err, stats) => {
          needToRecompileSSRBundle = false
          emitter.emit(`DEV_SSR_COMPILATION_DONE`)
          devssrWebpackWatcher.suspend()

          if (err) {
            return reject(err)
          } else {
            newHash = stats?.hash || ``

            const {
              restartWorker,
            } = require(`../utils/dev-ssr/render-dev-html`)
            // Make sure we use the latest version during development
            if (oldHash !== `` && newHash !== oldHash) {
              restartWorker(`${directory}/public/render-page.js`)
            }

            oldHash = newHash

            return resolve({
              stats: stats as Stats,
              waitForCompilerClose: Promise.resolve(),
            })
          }
        }
      ) as IWebpackWatchingPauseResume
    }
  })

const doBuildRenderer = async (
  { directory }: IProgram,
  webpackConfig: webpack.Configuration,
  stage: Stage,
  parentSpan?: Span
): Promise<{ rendererPath: string; waitForCompilerClose }> => {
  const { stats, waitForCompilerClose } = await runWebpack(
    webpackConfig,
    stage,
    directory,
    parentSpan
  )
  if (stats.hasErrors()) {
    reporter.panic(structureWebpackErrors(stage, stats.compilation.errors))
  }

  if (
    stage === `build-html` &&
    store.getState().html.ssrCompilationHash !== stats.hash
  ) {
    store.dispatch({
      type: `SET_SSR_WEBPACK_COMPILATION_HASH`,
      payload: stats.hash as string,
    })
  }

  // render-page.js is hard coded in webpack.config
  return {
    rendererPath: `${directory}/public/render-page.js`,
    waitForCompilerClose,
  }
}

export const buildRenderer = async (
  program: IProgram,
  stage: Stage,
  parentSpan?: IActivity
): Promise<{ rendererPath: string; waitForCompilerClose }> => {
  const { directory } = program
  const config = await webpackConfig(program, directory, stage, null, {
    parentSpan,
  })

  return doBuildRenderer(program, config, stage, parentSpan)
}

export const buildSSRRenderer = async (
  program: IProgram,
  pages: any,
  mode: "production" | "development",
  parentSpan?: IActivity
): Promise<Array<any>> => {
  const { directory } = program
  // TODO refactor to virtual files or improve bundling

  const cacheDir = path.join(directory, `.cache`)
  const ssrDir = path.join(cacheDir, `_ssr`)
  await fs.mkdirs(path.join(ssrDir, `page-data`))

  const webpackStats = await fs.readJSON(
    path.join(directory, `public`, `webpack.stats.json`)
  )

  const entries = {}
  const manifest: Array<IGatsbyFunction> = []
  for (const page of pages) {
    if (!entries[page.componentChunkName]) {
      const stylesSet = new Set<string>()
      const scriptsSet = new Set<string>()
      for (const chunkName of [`app`, page.componentChunkName]) {
        const assets = webpackStats.assetsByChunkName[chunkName]
        if (!assets) {
          continue
        }

        for (const asset of assets) {
          if (asset === `/`) {
            continue
          }

          if (asset.endsWith(`.js`)) {
            scriptsSet.add(asset)
          }
          if (asset.endsWith(`.css`)) {
            stylesSet.add(asset)
          }
        }
      }
      await fs.writeFile(
        path.join(ssrDir, `${page.componentChunkName}.js`),
        `
import * as React from 'react';
import ssrRender from '../static-entry-ssr.js';
import * as componentModule from "${page.component}"
import * as webpackStats from "../../public/webpack.stats.json";

const stylesSet = new Set();
const scriptsSet = new Set();
for (const chunkName of ["app", "${page.componentChunkName}"]) {
  const assets = webpackStats.assetsByChunkName[chunkName]
  if (!assets) {
    continue
  }

  for (const asset of assets) {
    if (asset === "/") {
      continue
    }

    if (asset.endsWith('.js')) {
      scriptsSet.add(asset)
    }
    if (asset.endsWith('.css')) {
      stylesSet.add(asset)
    }
  }
}

const styles = ${JSON.stringify(
          Array.from(stylesSet).map(asset => {
            return {
              name: asset,
              rel: `preload`,
              content:
                mode === `production`
                  ? fs
                      .readFileSync(path.join(directory, `public`, asset))
                      .toString()
                  : ``,
            }
          })
        )}
const scripts = ${JSON.stringify(
          Array.from(scriptsSet).map(asset => {
            return { name: asset, rel: `preload` }
          })
        )}
const reversedStyles = styles.slice(0).reverse();
const reversedScripts = scripts.slice(0).reverse();

export default async function ssrPage(req, res) {
  const { html } = await ssrRender({
    pagePath: req.originalUrl,
    pageParams: req.params,
    pageData: {},
    staticQueryContext: {},
    styles,
    scripts,
    reversedStyles,
    reversedScripts,
    componentModule,
  });

  res.send(html);
}
    `
      )

      await fs.writeFile(
        path.join(ssrDir, `page-data`, `${page.componentChunkName}.js`),
        `
  import * as React from 'react';
  import { getServerData } from "${page.component}"

export default async function ssrPageJson(req, res) {
  let serverData = null;
  if (getServerData) {
    serverData = await Promise.resolve(getServerData({
      params: req.params,
    }))
  }

  res.json({
    "componentChunkName": "${page.componentChunkName}",
    "path": req.originalUrl.replace('/page-data', '').replace('page-data.json', ''),
    "result": {
      "serverData": serverData,
      "pageContext": {},
    },
    "staticQueryHashes": []
  })
}
    `
      )

      entries[page.componentChunkName] = path.join(
        ssrDir,
        `${page.componentChunkName}.js`
      )
      entries[`page-data/` + page.componentChunkName] = path.join(
        ssrDir,
        `page-data`,
        `${page.componentChunkName}.js`
      )
    }

    manifest.push({
      functionRoute: `_ssr/${page.path.slice(1)}`,
      pluginName: `default-site-plugin`,
      originalAbsoluteFilePath: path.join(
        ssrDir,
        `${page.componentChunkName}.js`
      ),
      originalRelativeFilePath: path.join(
        `_ssr`,
        `${page.componentChunkName}.js`
      ),
      relativeCompiledFilePath: path.join(
        `_ssr`,
        `${page.componentChunkName}.js`
      ),
      absoluteCompiledFilePath: path.join(
        cacheDir,
        `functions`,
        `_ssr`,
        `${page.componentChunkName}.js`
      ),
      matchPath: getMatchPath(`_ssr` + page.path),
    })
    manifest.push({
      functionRoute: `_ssr/page-data/${page.path.slice(1)}`,
      pluginName: `default-site-plugin`,
      originalAbsoluteFilePath: path.join(
        ssrDir,
        `page-data`,
        `${page.componentChunkName}.js`
      ),
      originalRelativeFilePath: path.join(
        `_ssr`,
        `page-data`,
        `${page.componentChunkName}.js`
      ),
      relativeCompiledFilePath: path.join(
        `_ssr`,
        `page-data`,
        `${page.componentChunkName}.js`
      ),
      absoluteCompiledFilePath: path.join(
        cacheDir,
        `functions`,
        `_ssr`,
        `page-data`,
        `${page.componentChunkName}.js`
      ),
      matchPath: getMatchPath(`_ssr/page-data` + page.path),
    })
  }

  const config = await webpackConfig(
    program,
    directory,
    Stage.BuildHTML,
    null,
    {
      parentSpan,
    }
  )
  config.entry = entries

  config.output.path = path.join(directory, `.cache`, `functions`, `_ssr`)
  delete config.output.filename
  delete config.externals

  const { waitForCompilerClose } = await runWebpack(
    config,
    Stage.BuildHTML,
    directory,
    parentSpan
  )

  const functionsManifest = await fs.readJSON(
    path.join(cacheDir, `functions`, `manifest.json`)
  )
  await fs.writeJSON(path.join(cacheDir, `functions`, `manifest.json`), [
    ...functionsManifest,
    ...manifest,
  ])

  if (mode === `production`) {
    await waitForCompilerClose
  }

  return manifest
}

export const deleteRenderer = async (rendererPath: string): Promise<void> => {
  try {
    await fs.remove(rendererPath)
    await fs.remove(`${rendererPath}.map`)
  } catch (e) {
    // This function will fail on Windows with no further consequences.
  }
}

export interface IRenderHtmlResult {
  unsafeBuiltinsUsageByPagePath: Record<string, Array<string>>
}

const renderHTMLQueue = async (
  workerPool: GatsbyWorkerPool,
  activity: IActivity,
  htmlComponentRendererPath: string,
  pages: Array<string>,
  stage: Stage = Stage.BuildHTML
): Promise<void> => {
  // We need to only pass env vars that are set programmatically in gatsby-cli
  // to child process. Other vars will be picked up from environment.
  const envVars: Array<[string, string | undefined]> = [
    [`NODE_ENV`, process.env.NODE_ENV],
    [`gatsby_executing_command`, process.env.gatsby_executing_command],
    [`gatsby_log_level`, process.env.gatsby_log_level],
  ]

  const segments = chunk(pages, 50)

  const sessionId = Date.now()

  const renderHTML =
    stage === `build-html`
      ? workerPool.single.renderHTMLProd
      : workerPool.single.renderHTMLDev

  const uniqueUnsafeBuiltinUsedStacks = new Set<string>()

  try {
    await Bluebird.map(segments, async pageSegment => {
      const renderHTMLResult = await renderHTML({
        envVars,
        htmlComponentRendererPath,
        paths: pageSegment,
        sessionId,
      })

      if (stage === `build-html`) {
        const htmlRenderMeta = renderHTMLResult as IRenderHtmlResult
        store.dispatch({
          type: `HTML_GENERATED`,
          payload: pageSegment,
        })

        for (const [_pagePath, arrayOfUsages] of Object.entries(
          htmlRenderMeta.unsafeBuiltinsUsageByPagePath
        )) {
          for (const unsafeUsageStack of arrayOfUsages) {
            uniqueUnsafeBuiltinUsedStacks.add(unsafeUsageStack)
          }
        }
      }

      if (activity && activity.tick) {
        activity.tick(pageSegment.length)
      }
    })
  } catch (e) {
    if (e?.context?.unsafeBuiltinsUsageByPagePath) {
      for (const [_pagePath, arrayOfUsages] of Object.entries(
        e.context.unsafeBuiltinsUsageByPagePath
      )) {
        // @ts-ignore TS doesn't know arrayOfUsages is Iterable
        for (const unsafeUsageStack of arrayOfUsages) {
          uniqueUnsafeBuiltinUsedStacks.add(unsafeUsageStack)
        }
      }
    }
    throw e
  } finally {
    if (uniqueUnsafeBuiltinUsedStacks.size > 0) {
      console.warn(
        `Unsafe builtin method was used, future builds will need to rebuild all pages`
      )
      store.dispatch({
        type: `SSR_USED_UNSAFE_BUILTIN`,
      })
    }

    for (const unsafeBuiltinUsedStack of uniqueUnsafeBuiltinUsedStacks) {
      const prettyError = await createErrorFromString(
        unsafeBuiltinUsedStack,
        `${htmlComponentRendererPath}.map`
      )

      const warningMessage = `${prettyError.stack}${
        prettyError.codeFrame ? `\n\n${prettyError.codeFrame}\n` : ``
      }`

      reporter.warn(warningMessage)
    }
  }
}

class BuildHTMLError extends Error {
  codeFrame = ``
  context?: {
    path: string
  }

  constructor(error: Error) {
    super(error.message)

    // We must use getOwnProperty because keys like `stack` are not enumerable,
    // but we want to copy over the entire error
    Object.getOwnPropertyNames(error).forEach(key => {
      this[key] = error[key]
    })
  }
}

const truncateObjStrings = (obj): IPageDataWithQueryResult => {
  // Recursively truncate strings nested in object
  // These objs can be quite large, but we want to preserve each field
  for (const key in obj) {
    if (typeof obj[key] === `object`) {
      truncateObjStrings(obj[key])
    } else if (typeof obj[key] === `string`) {
      obj[key] = truncate(obj[key], { length: 250 })
    }
  }

  return obj
}

export const doBuildPages = async (
  rendererPath: string,
  pagePaths: Array<string>,
  activity: IActivity,
  workerPool: GatsbyWorkerPool,
  stage: Stage
): Promise<void> => {
  try {
    await renderHTMLQueue(workerPool, activity, rendererPath, pagePaths, stage)
  } catch (error) {
    const pageData = await getPageData(error.context.path)
    const truncatedPageData = truncateObjStrings(pageData)

    const pageDataMessage = `Page data from page-data.json for the failed page "${
      error.context.path
    }": ${JSON.stringify(truncatedPageData, null, 2)}`

    const prettyError = await createErrorFromString(
      error.stack,
      `${rendererPath}.map`
    )

    const buildError = new BuildHTMLError(prettyError)
    buildError.context = error.context

    reporter.error(pageDataMessage)
    throw buildError
  }
}

// TODO remove in v4 - this could be a "public" api
export const buildHTML = async ({
  program,
  stage,
  pagePaths,
  activity,
  workerPool,
}: {
  program: IProgram
  stage: Stage
  pagePaths: Array<string>
  activity: IActivity
  workerPool: GatsbyWorkerPool
}): Promise<void> => {
  const { rendererPath } = await buildRenderer(program, stage, activity.span)
  await doBuildPages(rendererPath, pagePaths, activity, workerPool, stage)
  await deleteRenderer(rendererPath)
}

export async function buildHTMLPagesAndDeleteStaleArtifacts({
  pageRenderer,
  workerPool,
  buildSpan,
  program,
}: {
  pageRenderer: string
  workerPool: GatsbyWorkerPool
  buildSpan?: Span
  program: IBuildArgs
}): Promise<{
  toRegenerate: Array<string>
  toDelete: Array<string>
}> {
  buildUtils.markHtmlDirtyIfResultOfUsedStaticQueryChanged()

  const {
    toRegenerate,
    toDelete,
    toCleanupFromTrackedState,
  } = buildUtils.calcDirtyHtmlFiles(store.getState())

  store.dispatch({
    type: `HTML_TRACKED_PAGES_CLEANUP`,
    payload: toCleanupFromTrackedState,
  })

  if (toRegenerate.length > 0) {
    const buildHTMLActivityProgress = reporter.createProgress(
      `Building static HTML for pages`,
      toRegenerate.length,
      0,
      {
        parentSpan: buildSpan,
      }
    )
    buildHTMLActivityProgress.start()
    try {
      await doBuildPages(
        pageRenderer,
        toRegenerate,
        buildHTMLActivityProgress,
        workerPool,
        Stage.BuildHTML
      )
    } catch (err) {
      let id = `95313` // TODO: verify error IDs exist
      const context = {
        errorPath: err.context && err.context.path,
        ref: ``,
      }

      const match = err.message.match(
        /ReferenceError: (window|document|localStorage|navigator|alert|location) is not defined/i
      )
      if (match && match[1]) {
        id = `95312`
        context.ref = match[1]
      }

      buildHTMLActivityProgress.panic({
        id,
        context,
        error: err,
      })
    }
    buildHTMLActivityProgress.end()
  } else {
    reporter.info(`There are no new or changed html files to build.`)
  }

  if (!program.keepPageRenderer) {
    try {
      await deleteRenderer(pageRenderer)
    } catch (err) {
      // pass through
    }
  }

  if (toDelete.length > 0) {
    const publicDir = path.join(program.directory, `public`)
    const deletePageDataActivityTimer = reporter.activityTimer(
      `Delete previous page data`
    )
    deletePageDataActivityTimer.start()
    await buildUtils.removePageFiles(publicDir, toDelete)

    deletePageDataActivityTimer.end()
  }

  return { toRegenerate, toDelete }
}
