// @flow

import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const websocketManager = require(`../utils/websocket-manager`)

const path = require(`path`)
const { store } = require(`../redux`)
const withResolverContext = require(`../schema/context`)
const { generatePathChunkName } = require(`../utils/js-chunk-names`)
const { formatErrorDetails } = require(`./utils`)

const resultHashes = {}

type QueryJob = {
  id: string,
  hash?: string,
  jsonName: string,
  query: string,
  componentPath: string,
  context: Object,
  isPage: Boolean,
}

type Args = {
  queryJob: QueryJob,
  component: Any,
}

const makePageData = ({ publicDir }, page, result) => {
  const fixedPagePath = page.path === `/` ? `index` : page.path
  const filePath = path.join(
    publicDir,
    `page-data`,
    fixedPagePath,
    `page-data.json`
  )
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    ...result,
  }
  return {
    filePath,
    body,
  }
}

// Run query
module.exports = async ({ queryJob, component }: Args) => {
  const { schema, program, pages } = store.getState()

  const graphql = (query, context) =>
    graphqlFunction(
      schema,
      query,
      context,
      withResolverContext(context, schema),
      context
    )

  // Run query
  let result
  // Nothing to do if the query doesn't exist.
  if (!queryJob.query || queryJob.query === ``) {
    result = {}
  } else {
    result = await graphql(queryJob.query, queryJob.context)
  }

  // If there's a graphql error then log the error. If we're building, also
  // quit.
  if (result && result.errors) {
    const errorDetails = new Map()
    errorDetails.set(`Errors`, result.errors || [])
    if (queryJob.isPage) {
      errorDetails.set(`URL path`, queryJob.context.path)
      errorDetails.set(
        `Context`,
        JSON.stringify(queryJob.context.context, null, 2)
      )
    }
    errorDetails.set(`Plugin`, queryJob.pluginCreatorId || `none`)
    errorDetails.set(`Query`, queryJob.query)

    report.panicOnBuild(`
The GraphQL query from ${queryJob.componentPath} failed.

${formatErrorDetails(errorDetails)}`)
  }

  // Add the page context onto the results.
  if (queryJob && queryJob.isPage) {
    result[`pageContext`] = Object.assign({}, queryJob.context)
  }

  // Delete internal data from pageContext
  if (result.pageContext) {
    delete result.pageContext.jsonName
    delete result.pageContext.path
    delete result.pageContext.internalComponentName
    delete result.pageContext.component
    delete result.pageContext.componentChunkName
    delete result.pageContext.updatedAt
    delete result.pageContext.pluginCreator___NODE
    delete result.pageContext.pluginCreatorId
    delete result.pageContext.componentPath
    delete result.pageContext.context
  }

  const resultJSON = JSON.stringify(result)
  const resultHash = require(`crypto`)
    .createHash(`sha1`)
    .update(resultJSON)
    .digest(`base64`)

  if (process.env.gatsby_executing_command === `develop`) {
    if (queryJob.isPage) {
      websocketManager.emitPageData({
        result,
        id: queryJob.id,
      })
    } else {
      websocketManager.emitStaticQueryData({
        result,
        id: queryJob.id,
      })
    }
  }

  if (resultHashes[queryJob.id] !== resultHash) {
    resultHashes[queryJob.id] = resultHash

    const publicDir = path.join(program.directory, `public`)
    if (queryJob.isPage) {
      const page = pages.get(queryJob.id)
      const { filePath, body } = makePageData({ publicDir }, page, result)
      await fs.outputFile(filePath, JSON.stringify(body))
    } else {
      const staticDir = path.join(publicDir, `static`)
      const resultPath = path.join(staticDir, `d`, `${queryJob.hash}.json`)
      await fs.outputFile(resultPath, resultJSON)
    }
  }

  return result
}
