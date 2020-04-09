// @flow

const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)

const path = require(`path`)
const { store } = require(`../redux`)
const { boundActionCreators } = require(`../redux/actions`)
const pageDataUtil = require(`../utils/page-data`)
const { getCodeFrame } = require(`./graphql-errors`)
const { default: errorParser } = require(`./error-parser`)

const resultHashes = new Map()

type QueryJob = {
  id: string,
  hash?: string,
  query: string,
  componentPath: string,
  context: Object,
  isPage: Boolean,
}

// Run query
module.exports = async (graphqlRunner, queryJob: QueryJob) => {
  const { program } = store.getState()

  const graphql = (query, context) => graphqlRunner.query(query, context)

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
    let urlPath = undefined
    let queryContext = {}
    const plugin = queryJob.pluginCreatorId || `none`

    if (queryJob.isPage) {
      urlPath = queryJob.context.path
      queryContext = queryJob.context.context
    }

    const structuredErrors = result.errors
      .map(e => {
        const structuredError = errorParser({
          message: e.message,
        })

        structuredError.context = {
          ...structuredError.context,
          codeFrame: getCodeFrame(
            queryJob.query,
            e.locations && e.locations[0].line,
            e.locations && e.locations[0].column
          ),
          filePath: queryJob.componentPath,
          ...(urlPath && { urlPath }),
          ...queryContext,
          plugin,
        }

        return structuredError
      })
      .filter(Boolean)

    report.panicOnBuild(structuredErrors)
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
  }

  const resultJSON = JSON.stringify(result)
  const resultHash = require(`crypto`)
    .createHash(`sha1`)
    .update(resultJSON)
    .digest(`base64`)
  if (resultHash !== resultHashes.get(queryJob.id)) {
    resultHashes.set(queryJob.id, resultHash)

    if (queryJob.isPage) {
      const publicDir = path.join(program.directory, `public`)
      const { pages } = store.getState()
      const page = pages.get(queryJob.id)
      await pageDataUtil.write({ publicDir }, page, result)
    } else {
      // The babel plugin is hard-coded to load static queries from
      // public/static/d/
      const resultPath = path.join(
        program.directory,
        `public`,
        `static`,
        `d`,
        `${queryJob.hash}.json`
      )
      await fs.outputFile(resultPath, resultJSON)
    }
  }

  boundActionCreators.pageQueryRun({
    path: queryJob.id,
    componentPath: queryJob.componentPath,
    isPage: queryJob.isPage,
  })

  // Sets pageData to the store, here for easier access to the resultHash
  if (
    process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES &&
    queryJob.isPage
  ) {
    boundActionCreators.setPageData({
      id: queryJob.id,
      resultHash,
    })
  }
  return result
}
