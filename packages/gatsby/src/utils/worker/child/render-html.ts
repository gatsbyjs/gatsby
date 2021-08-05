/* eslint-disable @typescript-eslint/no-namespace */

import fs from "fs-extra"
import Bluebird from "bluebird"
import * as path from "path"

import { getPageHtmlFilePath } from "../../page-html"
import {
  readWebpackStats,
  getScriptsAndStylesForTemplate,
  clearCache as clearAssetsMappingCache,
} from "../../client-assets-for-template"
import type { IPageDataWithQueryResult } from "../../page-data"
import type { IRenderHtmlResult } from "../../../commands/build-html"
import {
  clearStaticQueryCaches,
  IResourcesForTemplate,
  getStaticQueryContext,
} from "../../static-query-utils"
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

const resourcesForTemplateCache = new Map<string, IResourcesForTemplate>()
const inFlightResourcesForTemplate = new Map<
  string,
  Promise<IResourcesForTemplate>
>()

function clearCaches(): void {
  clearStaticQueryCaches()
  resourcesForTemplateCache.clear()
  inFlightResourcesForTemplate.clear()

  clearAssetsMappingCache()
}

async function readPageData(
  publicDir: string,
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  const filePath = join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

async function doGetResourcesForTemplate(
  pageData: IPageDataWithQueryResult
): Promise<IResourcesForTemplate> {
  const scriptsAndStyles = await getScriptsAndStylesForTemplate(
    pageData.componentChunkName,
    webpackStats
  )

  const { staticQueryContext } = await getStaticQueryContext(
    pageData.staticQueryHashes
  )

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

        const {
          html,
          unsafeBuiltinsUsage,
        } = await htmlComponentRenderer.default({
          pagePath,
          pageData,
          ...resourcesForTemplate,
        })

        if (unsafeBuiltinsUsage.length > 0) {
          unsafeBuiltinsUsageByPagePath[pagePath] = unsafeBuiltinsUsage
        }

        return fs.outputFile(getPageHtmlFilePath(publicDir, pagePath), html)
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
        return fs.outputFile(
          getPageHtmlFilePath(outputDir, pagePath),
          htmlString
        )
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
