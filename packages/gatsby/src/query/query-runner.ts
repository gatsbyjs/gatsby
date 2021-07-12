import { Span } from "opentracing"
import _ from "lodash"
import fs from "fs-extra"
import report from "gatsby-cli/lib/reporter"
import crypto from "crypto"
import { ExecutionResult, GraphQLError } from "graphql"

import path from "path"
import { store } from "../redux"
import { actions } from "../redux/actions"
import { getCodeFrame } from "./graphql-errors"
import errorParser from "./error-parser"

import { GraphQLRunner } from "./graphql-runner"
import { IExecutionResult, PageContext } from "./types"
import { pageDataExists } from "../utils/page-data"

const resultHashes = new Map()

export interface IQueryJob {
  id: string
  hash?: string
  query: string
  componentPath: string
  context: PageContext
  isPage: boolean
  pluginCreatorId?: string
}

function reportLongRunningQueryJob(queryJob): void {
  const messageParts = [
    `Query takes too long:`,
    `File path: ${queryJob.componentPath}`,
  ]

  if (queryJob.isPage) {
    const { path, context } = queryJob.context
    messageParts.push(`URL path: ${path}`)

    if (!_.isEmpty(context)) {
      messageParts.push(`Context: ${JSON.stringify(context, null, 4)}`)
    }
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

  if (queryJob.isPage) {
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
      isPage: queryJob.isPage,
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

  // Add the page context onto the results.
  if (queryJob && queryJob.isPage) {
    result[`pageContext`] = Object.assign({}, queryJob.context)
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
    delete result.pageContext.mode
  }

  const resultJSON = JSON.stringify(result)
  const resultHash = crypto
    .createHash(`sha1`)
    .update(resultJSON)
    .digest(`base64`)

  if (
    resultHash !== resultHashes.get(queryJob.id) ||
    (queryJob.isPage &&
      !pageDataExists(path.join(program.directory, `public`), queryJob.id))
  ) {
    resultHashes.set(queryJob.id, resultHash)

    if (queryJob.isPage) {
      // We need to save this temporarily in cache because
      // this might be incomplete at the moment
      const resultPath = path.join(
        program.directory,
        `.cache`,
        `json`,
        `${queryJob.id.replace(/\//g, `_`)}.json`
      )
      await fs.outputFile(resultPath, resultJSON)
      store.dispatch({
        type: `ADD_PENDING_PAGE_DATA_WRITE`,
        payload: {
          path: queryJob.id,
        },
      })
    } else {
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
      isPage: queryJob.isPage,
      resultHash,
      queryHash: queryJob.hash,
    })
  )

  return result
}
