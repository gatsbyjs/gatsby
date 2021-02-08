import fs from "fs-extra"
import Bluebird from "bluebird"
import { join } from "path"
import { get, isObject, flatten, uniqBy, concat } from "lodash"

import { getPageHtmlFilePath } from "../../utils/page-html"
import { IPageDataWithQueryResult } from "../../utils/page-data"
import { Stage } from "../../commands/types"

let lastRenderHTMLCallTimestamp = 0
let htmlComponentRenderer
let webpackStats

const staticQueryResultCache = new Map<string, any>()
const inFlightStaticQueryPromise = new Map<string, Promise<any>>()

const inlineCssCache = new Map<string, string>()
const inFlightInlineCssPromise = new Map<string, Promise<string>>()

const resourcesForTemplateCache = new Map<string, IResourcesForTemplate>()
const inFlightResourcesForTemplate = new Map<
  string,
  Promise<IResourcesForTemplate>
>()

const getStaticQueryPath = (hash: string): string =>
  join(`page-data`, `sq`, `d`, `${hash}.json`)

const getStaticQueryResult = async (hash: string): any => {
  const staticQueryPath = getStaticQueryPath(hash)
  const absoluteStaticQueryPath = join(process.cwd(), `public`, staticQueryPath)
  const staticQueryRaw = await fs.readFile(absoluteStaticQueryPath)

  return JSON.parse(staticQueryRaw.toString())
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

async function readWebpackStats(publicDir: string): any {
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

async function getScriptsAndStylesForTemplate(
  componentChunkName
): Promise<IScriptsAndStyles> {
  // Create paths to scripts
  let scriptsAndStyles = flatten(
    [`app`, componentChunkName].map(s => {
      const fetchKey = `assetsByChunkName[${s}]`

      let chunks = get(webpackStats, fetchKey)
      const namedChunkGroups = get(webpackStats, `namedChunkGroups`)

      if (!chunks) {
        return null
      }

      chunks = chunks.map(chunk => {
        if (chunk === `/`) {
          return null
        }
        return { rel: `preload`, name: chunk }
      })

      namedChunkGroups[s].assets.forEach(asset =>
        chunks.push({ rel: `preload`, name: asset })
      )

      const childAssets = namedChunkGroups[s].childAssets
      for (const rel in childAssets) {
        chunks = concat(
          chunks,
          childAssets[rel].map(chunk => {
            return { rel, name: chunk }
          })
        )
      }

      return chunks
    })
  )
    .filter(s => isObject(s))
    .sort((s1, s2) => (s1.rel == `preload` ? -1 : 1)) // given priority to preload

  scriptsAndStyles = uniqBy(scriptsAndStyles, item => item.name)

  const scripts = scriptsAndStyles.filter(
    script => script.name && script.name.endsWith(`.js`)
  )
  const styles = scriptsAndStyles.filter(
    style => style.name && style.name.endsWith(`.css`)
  )

  return {
    scripts,
    styles,
    reversedStyles: await Promise.all(
      styles
        .slice(0)
        .reverse()
        .map(async style => {
          if (style.rel !== `prefetch`) {
            const memoizedInlineCss = inlineCssCache.get(style.name)
            if (memoizedInlineCss) {
              return {
                ...style,
                content: memoizedInlineCss,
              }
            }

            let getInlineCssPromise = inFlightInlineCssPromise.get(style.name)
            if (!getInlineCssPromise) {
              getInlineCssPromise = fs
                .readFile(join(process.cwd(), `public`, style.name), `utf-8`)
                .then(content => {
                  inlineCssCache.set(style.name, content)
                  inFlightInlineCssPromise.delete(style.name)

                  return content
                })

              inFlightInlineCssPromise.set(style.name, getInlineCssPromise)
            }

            return {
              ...style,
              content: await getInlineCssPromise,
            }
          }

          return style
        })
    ),
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
    const memoizedStaticQueryResult = staticQueryResultCache.get(
      staticQueryHash
    )
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
  timestamp,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  envVars: Array<Array<string>>
  timestamp: number
}): Promise<Array<unknown>> => {
  const publicDir = join(process.cwd(), `public`)

  if (timestamp !== lastRenderHTMLCallTimestamp) {
    staticQueryResultCache.clear()
    resourcesForTemplateCache.clear()
    // This is being executed in child process, so we need to set some vars
    // for modules that aren't bundled by webpack.
    envVars.forEach(([key, value]) => (process.env[key] = value))

    htmlComponentRenderer = require(htmlComponentRendererPath)

    webpackStats = await readWebpackStats(publicDir)

    lastRenderHTMLCallTimestamp = timestamp
  }

  return Bluebird.map(paths, async pagePath => {
    try {
      const pageData = await readPageData(publicDir, pagePath)
      const resourcesForTemplate = await getResourcesForTemplate(pageData)

      const htmlString = htmlComponentRenderer.default({
        pagePath,
        pageData,
        ...resourcesForTemplate,
      })

      return fs.outputFile(getPageHtmlFilePath(publicDir, pagePath), htmlString)
    } catch (e) {
      // add some context to error so we can display more helpful message
      e.context = {
        path: pagePath,
      }
      throw e
    }
  })
}

// TODO: remove when DEV_SSR is done
export const renderHTMLDev = async ({
  htmlComponentRendererPath,
  paths,
  envVars,
  timestamp,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  envVars: Array<Array<string>>
  timestamp: number
}): Promise<Array<unknown>> => {
  const outputDir = join(process.cwd(), `.cache`, `develop-html`)
  if (timestamp !== lastRenderHTMLCallTimestamp) {
    // This is being executed in child process, so we need to set some vars
    // for modules that aren't bundled by webpack.
    envVars.forEach(([key, value]) => (process.env[key] = value))

    htmlComponentRenderer = require(htmlComponentRendererPath)

    lastRenderHTMLCallTimestamp = timestamp
  }

  return Bluebird.map(paths, async pagePath => {
    try {
      const htmlString = htmlComponentRenderer.default({
        pagePath,
      })
      return fs.outputFile(getPageHtmlFilePath(outputDir, pagePath), htmlString)
    } catch (e) {
      // add some context to error so we can display more helpful message
      e.context = {
        path: pagePath,
      }
      throw e
    }
  })
}
