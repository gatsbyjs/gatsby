// "engines-fs-provider" must be first import, as it sets up global
// fs and this need to happen before anything else tries to import fs
import "../engines-fs-provider"

// just types - those should not be bundled
import type { GraphQLEngine } from "../../schema/graphql-engine/entry"
import type { IExecutionResult } from "../../query/types"
import type {
  IGatsbyPage,
  IGatsbySlice,
  IGatsbyState,
  IHeader,
} from "../../redux/types"
import { IGraphQLTelemetryRecord } from "../../schema/type-definitions"
import type { IScriptsAndStyles } from "../client-assets-for-template"
import type { IPageDataWithQueryResult, ISliceData } from "../page-data"
import type { Request } from "express"
import type { Span, SpanContext } from "opentracing"

// actual imports
import * as path from "path"
import * as fs from "fs-extra"
import {
  constructPageDataString,
  getPagePathFromPageDataPath,
} from "../page-data-helpers"
// @ts-ignore render-page import will become valid later on (it's marked as external)
import htmlComponentRenderer, { getPageChunk } from "./routes/render-page"
import { getServerData, IServerData } from "../get-server-data"
import reporter from "gatsby-cli/lib/reporter"
import { initTracer } from "../tracer"
import { getCodeFrame } from "../../query/graphql-errors-codeframe"
import { ICollectedSlice } from "../babel/find-slices"
import { createHeadersMatcher } from "../adapter/create-headers"
import { MUST_REVALIDATE_HEADERS } from "../adapter/constants"
import { getRoutePathFromPage } from "../adapter/get-route-path"
import { findPageByPath } from "../find-page-by-path"

export interface ITemplateDetails {
  query: string
  staticQueryHashes: Array<string>
  assets: IScriptsAndStyles
}

export type EnginePage = Pick<
  IGatsbyPage,
  | "componentChunkName"
  | "componentPath"
  | "context"
  | "matchPath"
  | "mode"
  | "path"
  | "slices"
>

export interface ISSRData {
  results: IExecutionResult
  page: EnginePage
  templateDetails: ITemplateDetails
  potentialPagePath: string
  /**
   * This is no longer really just serverDataHeaders, as we add headers
   * from user defined in gatsby-config
   */
  serverDataHeaders?: Record<string, string>
  serverDataStatus?: number
  searchString: string
}

// just letting TypeScript know about injected data
// with DefinePlugin
declare global {
  const INLINED_TEMPLATE_TO_DETAILS: Record<string, ITemplateDetails>
  const INLINED_HEADERS_CONFIG: Array<IHeader> | undefined
  const WEBPACK_COMPILATION_HASH: string
  const GATSBY_SLICES_SCRIPT: string
  const GATSBY_PAGES: Array<[string, EnginePage]>
  const PATH_PREFIX: string
}

const tracerReadyPromise = initTracer(
  process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``
)

type MaybePhantomActivity =
  | ReturnType<typeof reporter.phantomActivity>
  | undefined

const createHeaders = createHeadersMatcher(INLINED_HEADERS_CONFIG, PATH_PREFIX)

interface IGetDataBaseArgs {
  pathName: string
  req?: Partial<Pick<Request, "query" | "method" | "url" | "headers">>
  spanContext?: Span | SpanContext
  telemetryResolverTimings?: Array<IGraphQLTelemetryRecord>
}

interface IGetDataEagerEngineArgs extends IGetDataBaseArgs {
  graphqlEngine: GraphQLEngine
}

interface IGetDataLazyEngineArgs extends IGetDataBaseArgs {
  getGraphqlEngine: () => Promise<GraphQLEngine>
}

type IGetDataArgs = IGetDataEagerEngineArgs | IGetDataLazyEngineArgs

function isEagerGraphqlEngine(
  arg: IGetDataArgs
): arg is IGetDataEagerEngineArgs {
  return typeof (arg as IGetDataEagerEngineArgs).graphqlEngine !== `undefined`
}

export async function getData(arg: IGetDataArgs): Promise<ISSRData> {
  const getGraphqlEngine = isEagerGraphqlEngine(arg)
    ? (): Promise<GraphQLEngine> => Promise.resolve(arg.graphqlEngine)
    : arg.getGraphqlEngine

  const { pathName, req, spanContext, telemetryResolverTimings } = arg
  await tracerReadyPromise

  let getDataWrapperActivity: MaybePhantomActivity
  try {
    if (spanContext) {
      getDataWrapperActivity = reporter.phantomActivity(`Running getData`, {
        parentSpan: spanContext,
      })
      getDataWrapperActivity.start()
    }

    let page: EnginePage
    let templateDetails: ITemplateDetails
    let potentialPagePath: string
    let findMetaActivity: MaybePhantomActivity
    try {
      if (getDataWrapperActivity) {
        findMetaActivity = reporter.phantomActivity(
          `Finding details about page and template`,
          {
            parentSpan: getDataWrapperActivity.span,
          }
        )
        findMetaActivity.start()
      }
      potentialPagePath = getPagePathFromPageDataPath(pathName) || pathName

      // 1. Find a page for pathname
      const maybePage = findEnginePageByPath(potentialPagePath)

      if (!maybePage) {
        // page not found, nothing to run query for
        throw new Error(`Page for "${pathName}" not found`)
      }

      page = maybePage

      // 2. Lookup query used for a page (template)
      templateDetails = INLINED_TEMPLATE_TO_DETAILS[page.componentChunkName]
      if (!templateDetails) {
        throw new Error(
          `Page template details for "${page.componentChunkName}" not found`
        )
      }
    } finally {
      if (findMetaActivity) {
        findMetaActivity.end()
      }
    }

    const executionPromises: Array<Promise<any>> = []

    // 3. Execute query
    // query-runner handles case when query is not there - so maybe we should consider using that somehow
    let results: IExecutionResult = {}
    let serverData: IServerData | undefined
    if (templateDetails.query) {
      let runningQueryActivity: MaybePhantomActivity
      if (getDataWrapperActivity) {
        runningQueryActivity = reporter.phantomActivity(`Running page query`, {
          parentSpan: getDataWrapperActivity.span,
        })
        runningQueryActivity.start()
      }
      executionPromises.push(
        getGraphqlEngine().then(graphqlEngine =>
          graphqlEngine
            .runQuery(
              templateDetails.query,
              {
                ...page,
                ...page.context,
              },
              {
                queryName: page.path,
                componentPath: page.componentPath,
                parentSpan: runningQueryActivity?.span,
                forceGraphqlTracing: !!runningQueryActivity,
                telemetryResolverTimings,
              }
            )
            .then(queryResults => {
              if (queryResults.errors && queryResults.errors.length > 0) {
                const e = queryResults.errors[0]
                const codeFrame = getCodeFrame(
                  templateDetails.query,
                  e.locations && e.locations[0].line,
                  e.locations && e.locations[0].column
                )

                const queryRunningError = new Error(
                  e.message + `\n\n` + codeFrame
                )
                queryRunningError.stack = e.stack
                throw queryRunningError
              } else {
                results = queryResults
              }
            })
            .finally(() => {
              if (runningQueryActivity) {
                runningQueryActivity.end()
              }
            })
        )
      )
    }

    // 4. (if SSR) run getServerData
    if (page.mode === `SSR`) {
      let runningGetServerDataActivity: MaybePhantomActivity
      if (getDataWrapperActivity) {
        runningGetServerDataActivity = reporter.phantomActivity(
          `Running getServerData`,
          {
            parentSpan: getDataWrapperActivity.span,
          }
        )
        runningGetServerDataActivity.start()
      }
      executionPromises.push(
        getPageChunk(page)
          .then(mod => getServerData(req, page, potentialPagePath, mod))
          .then(serverDataResults => {
            serverData = serverDataResults
          })
          .finally(() => {
            if (runningGetServerDataActivity) {
              runningGetServerDataActivity.end()
            }
          })
      )
    }

    await Promise.all(executionPromises)

    if (serverData) {
      results.serverData = serverData.props
    }
    results.pageContext = page.context

    const serverDataHeaders = {}

    // get headers from defaults and config
    const headersFromConfig = createHeaders(
      getRoutePathFromPage(page),
      MUST_REVALIDATE_HEADERS
    )
    // convert headers array to object
    for (const header of headersFromConfig) {
      serverDataHeaders[header.key] = header.value
    }

    if (serverData?.headers) {
      // add headers from getServerData to object (which will overwrite headers from config if overlapping)
      for (const [headerKey, headerValue] of Object.entries(
        serverData.headers
      )) {
        serverDataHeaders[headerKey] = headerValue
      }
    }

    let searchString = ``

    if (req?.query) {
      const maybeQueryString = Object.entries(req.query)
        .map(
          ([k, v]) =>
            // Preserve QueryString encoding
            `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`
        )
        .join(`&`)
      if (maybeQueryString) {
        searchString = `?${maybeQueryString}`
      }
    }

    return {
      results,
      page,
      templateDetails,
      potentialPagePath,
      serverDataHeaders,
      serverDataStatus: serverData?.status,
      searchString,
    }
  } finally {
    if (getDataWrapperActivity) {
      getDataWrapperActivity.end()
    }
  }
}

function getPath(data: ISSRData): string {
  return (
    (data.page.mode !== `SSG` && data.page.matchPath
      ? data.potentialPagePath
      : data.page.path) + (data.page.mode === `SSR` ? data.searchString : ``)
  )
}

export async function renderPageData({
  data,
  spanContext,
}: {
  data: ISSRData
  spanContext?: Span | SpanContext
}): Promise<IPageDataWithQueryResult> {
  await tracerReadyPromise

  let activity: MaybePhantomActivity
  try {
    if (spanContext) {
      activity = reporter.phantomActivity(`Rendering page-data`, {
        parentSpan: spanContext,
      })
      activity.start()
    }

    const componentPath = data.page.componentPath
    const sliceOverrides = data.page.slices

    // @ts-ignore GATSBY_SLICES is being "inlined" by bundler
    const slicesFromBundler = GATSBY_SLICES as {
      [key: string]: IGatsbySlice
    }
    const slices: IGatsbyState["slices"] = new Map()
    for (const [key, value] of Object.entries(slicesFromBundler)) {
      slices.set(key, value)
    }

    const slicesUsedByTemplatesFromBundler =
      // @ts-ignore GATSBY_SLICES_BY_TEMPLATE is being "inlined" by bundler
      GATSBY_SLICES_BY_TEMPLATE as {
        [key: string]: { [key: string]: ICollectedSlice }
      }
    const slicesUsedByTemplates: IGatsbyState["slicesByTemplate"] = new Map()
    for (const [key, value] of Object.entries(
      slicesUsedByTemplatesFromBundler
    )) {
      slicesUsedByTemplates.set(key, value)
    }

    // TODO: optimize this to only pass name for slices, as it's only used for validation

    const results = await constructPageDataString(
      {
        componentChunkName: data.page.componentChunkName,
        path: getPath(data),
        matchPath: data.page.matchPath,
        staticQueryHashes: data.templateDetails.staticQueryHashes,
        componentPath,
        slices: sliceOverrides,
      },
      JSON.stringify(data.results),
      slicesUsedByTemplates,
      slices
    )

    return JSON.parse(results)
  } finally {
    if (activity) {
      activity.end()
    }
  }
}
const readStaticQuery = async (
  staticQueryHash: string
): Promise<Record<string, { data: unknown }>> => {
  const filePath = path.join(__dirname, `sq`, `${staticQueryHash}.json`)
  const rawSQContext = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawSQContext)
}

const readSliceData = async (sliceName: string): Promise<ISliceData> => {
  const filePath = path.join(__dirname, `slice-data`, `${sliceName}.json`)

  const rawSliceData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawSliceData)
}

export async function renderHTML({
  data,
  pageData,
  spanContext,
}: {
  data: ISSRData
  pageData?: IPageDataWithQueryResult
  spanContext?: Span | SpanContext
}): Promise<string> {
  await tracerReadyPromise

  let wrapperActivity: MaybePhantomActivity
  try {
    if (spanContext) {
      wrapperActivity = reporter.phantomActivity(`Rendering HTML`, {
        parentSpan: spanContext,
      })
      wrapperActivity.start()
    }

    if (!pageData) {
      pageData = await renderPageData({
        data,
        spanContext: wrapperActivity?.span,
      })
    }

    const sliceData: Record<string, ISliceData> = {}
    if (_CFLAGS_.GATSBY_MAJOR === `5` && process.env.GATSBY_SLICES) {
      let readSliceDataActivity: MaybePhantomActivity
      try {
        if (wrapperActivity) {
          readSliceDataActivity = reporter.phantomActivity(
            `Preparing slice-data`,
            {
              parentSpan: wrapperActivity.span,
            }
          )
          readSliceDataActivity.start()
        }
        for (const sliceName of Object.values(pageData.slicesMap)) {
          sliceData[sliceName] = await readSliceData(sliceName)
        }
      } finally {
        if (readSliceDataActivity) {
          readSliceDataActivity.end()
        }
      }
    }

    let readStaticQueryContextActivity: MaybePhantomActivity
    let staticQueryContext: Record<string, { data: unknown }>
    try {
      if (wrapperActivity) {
        readStaticQueryContextActivity = reporter.phantomActivity(
          `Preparing StaticQueries context`,
          {
            parentSpan: wrapperActivity.span,
          }
        )
        readStaticQueryContextActivity.start()
      }

      const staticQueryHashes = new Set<string>(pageData.staticQueryHashes)
      for (const singleSliceData of Object.values(sliceData)) {
        for (const staticQueryHash of singleSliceData.staticQueryHashes) {
          staticQueryHashes.add(staticQueryHash)
        }
      }

      const contextsToMerge = await Promise.all(
        Array.from(staticQueryHashes).map(async staticQueryHash => {
          return {
            [staticQueryHash]: await readStaticQuery(staticQueryHash),
          }
        })
      )

      staticQueryContext = Object.assign({}, ...contextsToMerge)
    } finally {
      if (readStaticQueryContextActivity) {
        readStaticQueryContextActivity.end()
      }
    }

    let renderHTMLActivity: MaybePhantomActivity
    try {
      if (wrapperActivity) {
        renderHTMLActivity = reporter.phantomActivity(
          `Actually rendering HTML`,
          {
            parentSpan: wrapperActivity.span,
          }
        )
        renderHTMLActivity.start()
      }

      const pagePath = getPath(data)
      const results = await htmlComponentRenderer({
        pagePath,
        pageData,
        staticQueryContext,
        webpackCompilationHash: WEBPACK_COMPILATION_HASH,
        ...data.templateDetails.assets,
        inlinePageData: data.page.mode === `SSR` && data.results.serverData,
        sliceData,
      })

      return results.html.replace(
        `<slice-start id="_gatsby-scripts-1"></slice-start><slice-end id="_gatsby-scripts-1"></slice-end>`,
        GATSBY_SLICES_SCRIPT
      )
    } finally {
      if (renderHTMLActivity) {
        renderHTMLActivity.end()
      }
    }
  } finally {
    if (wrapperActivity) {
      wrapperActivity.end()
    }
  }
}

const stateWithPages = {
  pages: new Map(GATSBY_PAGES),
} as unknown as IGatsbyState

export function findEnginePageByPath(pathName: string): EnginePage | undefined {
  return findPageByPath(stateWithPages, pathName, false)
}
