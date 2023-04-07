import { Span } from "opentracing"
import _ from "lodash"
import fs from "fs-extra"
import report from "gatsby-cli/lib/reporter"
import { ExecutionResult, GraphQLError } from "graphql"
import { sha1 } from "gatsby-core-utils/hash"

import path from "path"
import { store } from "../redux"
import { actions } from "../redux/actions"
import { getCodeFrame } from "./graphql-errors-codeframe"
import errorParser from "./error-parser"

import { GraphQLRunner } from "./graphql-runner"
import { IExecutionResult, PageContext } from "./types"
import { pageDataExists, savePageQueryResult } from "../utils/page-data"
import GatsbyCacheLmdb from "../utils/cache-lmdb"

let resultHashCache: GatsbyCacheLmdb | undefined
function getResultHashCache(): GatsbyCacheLmdb {
  if (!resultHashCache) {
    resultHashCache = new GatsbyCacheLmdb({
      name: `query-result-hashes`,
      encoding: `string`,
    }).init()
  }
  return resultHashCache
}

export interface IQueryJob {
  id: string
  hash?: string
  query: string
  componentPath: string
  context: PageContext
  queryType: "page" | "static" | "slice"
  pluginCreatorId?: string
}

function reportLongRunningQueryJob(queryJob: IQueryJob): void {
  const messageParts = [
    `This query took more than 15s to run — which might indicate you're querying too much or have some unoptimized code:`,
    `File path: ${queryJob.componentPath}`,
  ]

  if (queryJob.queryType === `page`) {
    messageParts.push(`URL path: ${queryJob.context.path}`)
  }

  report.warn(messageParts.join(`\n`))
}

function panicQueryJobError(
  queryJob: IQueryJob,
  errors: ReadonlyArray<GraphQLError>
): void {
  let urlPath = undefined
  let queryContext = {}
  const plugin = queryJob.pluginCreatorId || `none`

  if (queryJob.queryType === `page`) {
    urlPath = queryJob.context.path
    queryContext = queryJob.context.context
  }

  const structuredErrors = errors.map(e => {
    const structuredError = errorParser({
      message: e.message,
      filePath: undefined,
      location: undefined,
      error: e,
    })

    structuredError.context = {
      ...structuredError.context,
      codeFrame: getCodeFrame(
        queryJob.query,
        e.locations && e.locations[0].line,
        e.locations && e.locations[0].column
      ),
      filePath: queryJob.componentPath,
      ...(urlPath ? { urlPath } : {}),
      ...queryContext,
      plugin,
    }

    return structuredError
  })

  report.panicOnBuild(structuredErrors)
}

async function startQueryJob(
  graphqlRunner: GraphQLRunner,
  queryJob: IQueryJob,
  parentSpan: Span | undefined
): Promise<ExecutionResult> {
  let isPending = true

  // Print out warning when query takes too long
  const timeoutId = setTimeout(() => {
    if (isPending) {
      reportLongRunningQueryJob(queryJob)
    }
  }, 15000)

  return graphqlRunner
    .query(queryJob.query, queryJob.context, {
      parentSpan,
      queryName: queryJob.id,
      componentPath: queryJob.componentPath,
    })
    .finally(() => {
      isPending = false
      clearTimeout(timeoutId)
    })
}

export async function queryRunner(
  graphqlRunner: GraphQLRunner,
  queryJob: IQueryJob,
  parentSpan: Span | undefined
): Promise<IExecutionResult> {
  const { program } = store.getState()

  store.dispatch(
    actions.queryStart({
      path: queryJob.id,
      componentPath: queryJob.componentPath,
      isPage: queryJob.queryType === `page`,
    })
  )

  // Run query
  let result: IExecutionResult
  // Nothing to do if the query doesn't exist.
  if (!queryJob.query || queryJob.query === ``) {
    result = {}
  } else {
    result = await startQueryJob(graphqlRunner, queryJob, parentSpan)
  }

  if (result.errors) {
    // If there's a graphql error then log the error and exit
    panicQueryJobError(queryJob, result.errors)
  }

  // Add the page/slice context onto the results.
  if (queryJob) {
    if (queryJob.queryType === `page`) {
      result[`pageContext`] = Object.assign({}, queryJob.context)
    } else if (queryJob.queryType === `slice`) {
      result[`sliceContext`] = Object.assign({}, queryJob.context)
    }
  }

  // Delete internal data from pageContext
  if (result.pageContext) {
    delete result.pageContext.path
    delete result.pageContext.internalComponentName
    delete result.pageContext.component
    delete result.pageContext.componentChunkName
    delete result.pageContext.updatedAt
    delete result.pageContext.pluginCreator___NODE
    delete result.pageContext.pluginCreatorId
    delete result.pageContext.componentPath
    delete result.pageContext.context
    delete result.pageContext.isCreatedByStatefulCreatePages
    delete result.pageContext.matchPath
    delete result.pageContext.mode
    delete result.pageContext.slices
  }

  const resultJSON = JSON.stringify(result)
  const resultHash = await sha1(resultJSON)

  const resultHashCache = getResultHashCache()

  let resultHashCacheKey = queryJob.id
  if (queryJob.queryType === `static`) {
    // For static queries we use hash for a file path we output results to.
    // With automatic sort and aggregation graphql codemod it is possible
    // to have same result, but different query text hashes which would skip
    // writing out file to disk if we don't check query hash as well
    resultHashCacheKey += `-${queryJob.hash}`
  }

  if (
    resultHash !== (await resultHashCache.get(resultHashCacheKey)) ||
    (queryJob.queryType === `page` &&
      !pageDataExists(path.join(program.directory, `public`), queryJob.id))
  ) {
    await resultHashCache.set(resultHashCacheKey, resultHash)

    if (queryJob.queryType === `page` || queryJob.queryType === `slice`) {
      // We need to save this temporarily in cache because
      // this might be incomplete at the moment
      await savePageQueryResult(queryJob.id, resultJSON)
      if (queryJob.queryType === `page`) {
        store.dispatch({
          type: `ADD_PENDING_PAGE_DATA_WRITE`,
          payload: {
            path: queryJob.id,
          },
        })
      } else if (queryJob.queryType === `slice`) {
        store.dispatch({
          type: `ADD_PENDING_SLICE_DATA_WRITE`,
          payload: {
            name: queryJob.id.substring(7), // remove "slice--" prefix
          },
        })
      }
    } else if (queryJob.queryType === `static`) {
      const resultPath = path.join(
        program.directory,
        `public`,
        `page-data`,
        `sq`,
        `d`,
        `${queryJob.hash}.json`
      )
      await fs.outputFile(resultPath, resultJSON)
    }
  }

  // Broadcast that a page's query has run.
  store.dispatch(
    actions.pageQueryRun({
      path: queryJob.id,
      componentPath: queryJob.componentPath,
      queryType: queryJob.queryType,
      resultHash,
      queryHash: queryJob.hash,
    })
  )

  return result
}
