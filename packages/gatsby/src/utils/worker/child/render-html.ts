/* eslint-disable @typescript-eslint/no-namespace */

import fs from "fs-extra"
import Bluebird from "bluebird"
import * as path from "path"
import { generateHtmlPath } from "gatsby-core-utils"
import { truncate } from "lodash"

import {
  readWebpackStats,
  getScriptsAndStylesForTemplate,
  clearCache as clearAssetsMappingCache,
} from "../../client-assets-for-template"
import { IPageDataWithQueryResult, readPageData } from "../../page-data"
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

const truncateObjStrings = (obj): IPageDataWithQueryResult => {
  // Recursively truncate strings nested in object
  // These objs can be quite large, but we want to preserve each field
  for (const key in obj) {
    if (typeof obj[key] === `object` && obj[key] !== null) {
      truncateObjStrings(obj[key])
    } else if (typeof obj[key] === `string`) {
      obj[key] = truncate(obj[key], { length: 250 })
    }
  }

  return obj
}

export const renderHTMLProd = async ({
  htmlComponentRendererPath,
  paths,
  envVars,
  sessionId,
  webpackCompilationHash,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  envVars: Array<[string, string | undefined]>
  sessionId: number
  webpackCompilationHash: string
}): Promise<IRenderHtmlResult> => {
  const publicDir = join(process.cwd(), `public`)
  const isPreview = process.env.GATSBY_IS_PREVIEW === `true`

  const unsafeBuiltinsUsageByPagePath = {}
  const previewErrors = {}

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
            webpackCompilationHash,
            ...resourcesForTemplate,
          })

        if (unsafeBuiltinsUsage.length > 0) {
          unsafeBuiltinsUsageByPagePath[pagePath] = unsafeBuiltinsUsage
        }

        await fs.outputFile(generateHtmlPath(publicDir, pagePath), html)
      } catch (e) {
        if (e.unsafeBuiltinsUsage && e.unsafeBuiltinsUsage.length > 0) {
          unsafeBuiltinsUsageByPagePath[pagePath] = e.unsafeBuiltinsUsage
        }
        // add some context to error so we can display more helpful message
        e.context = {
          path: pagePath,
          unsafeBuiltinsUsageByPagePath,
        }

        // If we're in Preview-mode, write out a simple error html file.
        if (isPreview) {
          const pageData = await readPageData(publicDir, pagePath)
          const truncatedPageData = truncateObjStrings(pageData)

          const html = `<h1>Preview build error</h1>
        <p>There was an error when building the preview page for this page ("${pagePath}").</p>
        <h3>Error</h3>
        <pre><code>${e.stack}</code></pre>
        <h3>Page component id</h3>
        <p><code>${pageData.componentChunkName}</code></p>
        <h3>Page data</h3>
        <pre><code>${JSON.stringify(truncatedPageData, null, 4)}</code></pre>`

          await fs.outputFile(generateHtmlPath(publicDir, pagePath), html)
          previewErrors[pagePath] = {
            e,
            message: e.message,
            code: e.code,
            stack: e.stack,
            name: e.name,
          }
        } else {
          throw e
        }
      }
    },
    { concurrency: 2 }
  )

  return { unsafeBuiltinsUsageByPagePath, previewErrors }
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
