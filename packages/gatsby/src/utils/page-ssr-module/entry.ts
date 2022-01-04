// "engines-fs-provider" must be first import, as it sets up global
// fs and this need to happen before anything else tries to import fs
import "../engines-fs-provider"

// just types - those should not be bundled
import type { GraphQLEngine } from "../../schema/graphql-engine/entry"
import type { IExecutionResult } from "../../query/types"
import type { IGatsbyPage } from "../../redux/types"
import { IGraphQLTelemetryRecord } from "../../schema/type-definitions"
import type { IScriptsAndStyles } from "../client-assets-for-template"
import type { IPageDataWithQueryResult } from "../page-data"
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

export interface ITemplateDetails {
  query: string
  staticQueryHashes: Array<string>
  assets: IScriptsAndStyles
}
export interface ISSRData {
  results: IExecutionResult
  page: IGatsbyPage
  templateDetails: ITemplateDetails
  potentialPagePath: string
  serverDataHeaders?: Record<string, string>
  serverDataStatus?: number
  searchString: string
}

// just letting TypeScript know about injected data
// with DefinePlugin
declare global {
  const INLINED_TEMPLATE_TO_DETAILS: Record<string, ITemplateDetails>
  const WEBPACK_COMPILATION_HASH: string
}

const tracerReadyPromise = initTracer(
  process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``
)

type MaybePhantomActivity =
  | ReturnType<typeof reporter.phantomActivity>
  | undefined

export async function getData({
  pathName,
  graphqlEngine,
  req,
  spanContext,
  telemetryResolverTimings,
}: {
  graphqlEngine: GraphQLEngine
  pathName: string
  req?: Partial<Pick<Request, "query" | "method" | "url" | "headers">>
  spanContext?: Span | SpanContext
  telemetryResolverTimings?: Array<IGraphQLTelemetryRecord>
}): Promise<ISSRData> {
  await tracerReadyPromise

  let getDataWrapperActivity: MaybePhantomActivity
  try {
    if (spanContext) {
      getDataWrapperActivity = reporter.phantomActivity(`Running getData`, {
        parentSpan: spanContext,
      })
      getDataWrapperActivity.start()
    }

    let page: IGatsbyPage
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
      const maybePage = graphqlEngine.findPageByPath(potentialPagePath)

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

    let searchString = ``
    if (req?.query) {
      const maybeQueryString = Object.entries(req.query)
        .map(([k, v]) => `${k}=${v}`)
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
      serverDataHeaders: serverData?.headers,
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
    const results = await constructPageDataString(
      {
        componentChunkName: data.page.componentChunkName,
        path: getPath(data),
        matchPath: data.page.matchPath,
        staticQueryHashes: data.templateDetails.staticQueryHashes,
      },
      JSON.stringify(data.results)
    )

    return JSON.parse(results)
  } finally {
    if (activity) {
      activity.end()
    }
  }
}

const readStaticQueryContext = async (
  templatePath: string
): Promise<Record<string, { data: unknown }>> => {
  const filePath = path.join(
    __dirname,
    `sq-context`,
    templatePath,
    `sq-context.json`
  )
  const rawSQContext = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawSQContext)
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
      staticQueryContext = await readStaticQueryContext(
        data.page.componentChunkName
      )
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

      const results = await htmlComponentRenderer({
        pagePath: getPath(data),
        pageData,
        staticQueryContext,
        webpackCompilationHash: WEBPACK_COMPILATION_HASH,
        ...data.templateDetails.assets,
        inlinePageData: data.page.mode === `SSR` && data.results.serverData,
      })

      return results.html
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
