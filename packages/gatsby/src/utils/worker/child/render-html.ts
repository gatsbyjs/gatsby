/* eslint-disable @typescript-eslint/no-namespace */

import fs from "fs-extra"
import Bluebird from "bluebird"
import * as path from "path"
import { generateHtmlPath, fixedPagePath } from "gatsby-core-utils"

import { IPageDataWithQueryResult } from "../../page-data"
import { IRenderHtmlResult } from "../../../commands/build-html"
// we want to force posix-style joins, so Windows doesn't produce backslashes for urls
const { join } = path.posix

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Global {
      unsafeBuiltinUsage: Array<string> | undefined
    }
  }
}

/**
 * Used to track if renderHTMLProd / renderHTMLDev are called within same "session" (from same renderHTMLQueue call).
 * As long as sessionId remains the same we can rely on memoized/cached resources for templates, css file content for inlining and static query results.
 * If session changes we invalidate our memoization caches.
 */
let lastSessionId = 0
let htmlComponentRenderer
let webpackStats

const staticQueryResultCache = new Map<string, any>()
const inFlightStaticQueryPromise = new Map<string, Promise<any>>()

const inlineCssPromiseCache = new Map<string, Promise<string>>()

const resourcesForTemplateCache = new Map<string, IResourcesForTemplate>()
const inFlightResourcesForTemplate = new Map<
  string,
  Promise<IResourcesForTemplate>
>()

function clearCaches(): void {
  staticQueryResultCache.clear()
  inFlightStaticQueryPromise.clear()

  resourcesForTemplateCache.clear()
  inFlightResourcesForTemplate.clear()

  inlineCssPromiseCache.clear()
}

const getStaticQueryPath = (hash: string): string =>
  join(`page-data`, `sq`, `d`, `${hash}.json`)

const getStaticQueryResult = async (hash: string): Promise<any> => {
  const staticQueryPath = getStaticQueryPath(hash)
  const absoluteStaticQueryPath = join(process.cwd(), `public`, staticQueryPath)
  const staticQueryRaw = await fs.readFile(absoluteStaticQueryPath)

  return JSON.parse(staticQueryRaw.toString())
}

async function readPageData(
  publicDir: string,
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const filePath = join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath),
    `page-data.json`
  )
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

async function readWebpackStats(publicDir: string): Promise<any> {
  const filePath = join(publicDir, `webpack.stats.json`)
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

interface IScriptsAndStyles {
  scripts: Array<any>
  styles: Array<any>
  reversedStyles: Array<any>
  reversedScripts: Array<any>
}

interface IChunk {
  name: string
  rel: string
  content?: string
}

async function getScriptsAndStylesForTemplate(
  componentChunkName
): Promise<IScriptsAndStyles> {
  const uniqScripts = new Map<string, IChunk>()
  const uniqStyles = new Map<string, IChunk>()

  /**
   * Add script or style to correct bucket. Make sure those are unique (no duplicates) and that "preload" will win over any other "rel"
   */
  function handleAsset(name: string, rel: string): void {
    let uniqueAssetsMap: Map<string, IChunk> | undefined

    // pick correct map depending on asset type
    if (name.endsWith(`.js`)) {
      uniqueAssetsMap = uniqScripts
    } else if (name.endsWith(`.css`)) {
      uniqueAssetsMap = uniqStyles
    }

    if (uniqueAssetsMap) {
      const existingAsset = uniqueAssetsMap.get(name)

      if (
        existingAsset &&
        rel === `preload` &&
        existingAsset.rel !== `preload`
      ) {
        // if we already track this asset, but it's not preload - make sure we make it preload
        // as it has higher priority
        existingAsset.rel = `preload`
      } else if (!existingAsset) {
        uniqueAssetsMap.set(name, { name, rel })
      }
    }
  }

  // Pick up scripts and styles that are used by a template using webpack.stats.json
  for (const chunkName of [`app`, componentChunkName]) {
    const assets = webpackStats.assetsByChunkName[chunkName]
    if (!assets) {
      continue
    }

    for (const asset of assets) {
      if (asset === `/`) {
        continue
      }

      handleAsset(asset, `preload`)
    }

    // Handling for webpack magic comments, for example:
    // import(/* webpackChunkName: "<chunk_name>", webpackPrefetch: true */ `<path_to_module>`)
    // Shape of webpackStats.childAssetsByChunkName:
    // {
    //   childAssetsByChunkName: {
    //     <name_of_top_level_chunk>: {
    //       prefetch: [
    //         "<chunk_name>-<chunk_hash>.js",
    //       ]
    //     }
    //   }
    // }
    const childAssets = webpackStats.childAssetsByChunkName[chunkName]
    if (!childAssets) {
      continue
    }

    for (const [rel, assets] of Object.entries(childAssets)) {
      // @ts-ignore TS doesn't like that assets is not typed and especially that it doesn't know that it's Iterable
      for (const asset of assets) {
        handleAsset(asset, rel)
      }
    }
  }

  // create scripts array, making sure "preload" scripts have priority
  const scripts: Array<IChunk> = []
  for (const scriptAsset of uniqScripts.values()) {
    if (scriptAsset.rel === `preload`) {
      // give priority to preload
      scripts.unshift(scriptAsset)
    } else {
      scripts.push(scriptAsset)
    }
  }

  // create styles array, making sure "preload" styles have priority and that we read .css content for non-prefetch "rel"s for inlining
  const styles: Array<IChunk> = []
  for (const styleAsset of uniqStyles.values()) {
    if (styleAsset.rel !== `prefetch`) {
      let getInlineCssPromise = inlineCssPromiseCache.get(styleAsset.name)
      if (!getInlineCssPromise) {
        getInlineCssPromise = fs.readFile(
          join(process.cwd(), `public`, styleAsset.name),
          `utf-8`
        )

        inlineCssPromiseCache.set(styleAsset.name, getInlineCssPromise)
      }

      styleAsset.content = await getInlineCssPromise
    }

    if (styleAsset.rel === `preload`) {
      // give priority to preload
      styles.unshift(styleAsset)
    } else {
      styles.push(styleAsset)
    }
  }

  return {
    scripts,
    styles,
    reversedStyles: styles.slice(0).reverse(),
    reversedScripts: scripts.slice(0).reverse(),
  }
}

interface IResourcesForTemplate extends IScriptsAndStyles {
  staticQueryContext: Record<string, any>
}

async function doGetResourcesForTemplate(
  pageData: IPageDataWithQueryResult
): Promise<IResourcesForTemplate> {
  const staticQueryResultPromises: Array<Promise<void>> = []
  const staticQueryContext: Record<string, any> = {}
  for (const staticQueryHash of pageData.staticQueryHashes) {
    const memoizedStaticQueryResult =
      staticQueryResultCache.get(staticQueryHash)
    if (memoizedStaticQueryResult) {
      staticQueryContext[staticQueryHash] = memoizedStaticQueryResult
      continue
    }

    let getStaticQueryPromise = inFlightStaticQueryPromise.get(staticQueryHash)
    if (!getStaticQueryPromise) {
      getStaticQueryPromise = getStaticQueryResult(staticQueryHash)
      inFlightStaticQueryPromise.set(staticQueryHash, getStaticQueryPromise)
      getStaticQueryPromise.then(() => {
        inFlightStaticQueryPromise.delete(staticQueryHash)
      })
    }

    staticQueryResultPromises.push(
      getStaticQueryPromise.then(results => {
        staticQueryContext[staticQueryHash] = results
      })
    )
  }

  const scriptsAndStyles = await getScriptsAndStylesForTemplate(
    pageData.componentChunkName
  )

  await Promise.all(staticQueryResultPromises)

  return {
    staticQueryContext,
    ...scriptsAndStyles,
  }
}

async function getResourcesForTemplate(
  pageData: IPageDataWithQueryResult
): Promise<IResourcesForTemplate> {
  const memoizedResourcesForTemplate = resourcesForTemplateCache.get(
    pageData.componentChunkName
  )
  if (memoizedResourcesForTemplate) {
    return memoizedResourcesForTemplate
  }

  const inFlight = inFlightResourcesForTemplate.get(pageData.componentChunkName)
  if (inFlight) {
    return inFlight
  }

  const doWorkPromise = doGetResourcesForTemplate(pageData)
  inFlightResourcesForTemplate.set(pageData.componentChunkName, doWorkPromise)

  const resources = await doWorkPromise

  resourcesForTemplateCache.set(pageData.componentChunkName, resources)
  inFlightResourcesForTemplate.delete(pageData.componentChunkName)

  return resources
}

export const renderHTMLProd = async ({
  htmlComponentRendererPath,
  paths,
  envVars,
  sessionId,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  envVars: Array<[string, string | undefined]>
  sessionId: number
}): Promise<IRenderHtmlResult> => {
  const publicDir = join(process.cwd(), `public`)

  const unsafeBuiltinsUsageByPagePath = {}

  // Check if we need to do setup and cache clearing. Within same session we can reuse memoized data,
  // but it's not safe to reuse them in different sessions. Check description of `lastSessionId` for more details
  if (sessionId !== lastSessionId) {
    clearCaches()

    // This is being executed in child process, so we need to set some vars
    // for modules that aren't bundled by webpack.
    envVars.forEach(([key, value]) => (process.env[key] = value))

    htmlComponentRenderer = require(htmlComponentRendererPath)

    webpackStats = await readWebpackStats(publicDir)

    lastSessionId = sessionId

    if (global.unsafeBuiltinUsage && global.unsafeBuiltinUsage.length > 0) {
      unsafeBuiltinsUsageByPagePath[`__import_time__`] =
        global.unsafeBuiltinUsage
    }
  }

  await Bluebird.map(
    paths,
    async pagePath => {
      try {
        const pageData = await readPageData(publicDir, pagePath)
        const resourcesForTemplate = await getResourcesForTemplate(pageData)

        const { html, unsafeBuiltinsUsage } =
          await htmlComponentRenderer.default({
            pagePath,
            pageData,
            ...resourcesForTemplate,
          })

        if (unsafeBuiltinsUsage.length > 0) {
          unsafeBuiltinsUsageByPagePath[pagePath] = unsafeBuiltinsUsage
        }

        return fs.outputFile(generateHtmlPath(publicDir, pagePath), html)
      } catch (e) {
        if (e.unsafeBuiltinsUsage && e.unsafeBuiltinsUsage.length > 0) {
          unsafeBuiltinsUsageByPagePath[pagePath] = e.unsafeBuiltinsUsage
        }
        // add some context to error so we can display more helpful message
        e.context = {
          path: pagePath,
          unsafeBuiltinsUsageByPagePath,
        }
        throw e
      }
    },
    { concurrency: 2 }
  )

  return { unsafeBuiltinsUsageByPagePath }
}

// TODO: remove when DEV_SSR is done
export const renderHTMLDev = async ({
  htmlComponentRendererPath,
  paths,
  envVars,
  sessionId,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  envVars: Array<[string, string | undefined]>
  sessionId: number
}): Promise<Array<unknown>> => {
  const outputDir = join(process.cwd(), `.cache`, `develop-html`)

  // Check if we need to do setup and cache clearing. Within same session we can reuse memoized data,
  // but it's not safe to reuse them in different sessions. Check description of `lastSessionId` for more details
  if (sessionId !== lastSessionId) {
    clearCaches()

    // This is being executed in child process, so we need to set some vars
    // for modules that aren't bundled by webpack.
    envVars.forEach(([key, value]) => (process.env[key] = value))

    htmlComponentRenderer = require(htmlComponentRendererPath)

    lastSessionId = sessionId
  }

  return Bluebird.map(
    paths,
    async pagePath => {
      try {
        const htmlString = await htmlComponentRenderer.default({
          pagePath,
        })
        return fs.outputFile(generateHtmlPath(outputDir, pagePath), htmlString)
      } catch (e) {
        // add some context to error so we can display more helpful message
        e.context = {
          path: pagePath,
        }
        throw e
      }
    },
    { concurrency: 2 }
  )
}
