// @flow

import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const websocketManager = require(`../../utils/websocket-manager`)

const path = require(`path`)
const { store } = require(`../../redux`)
const { generatePathChunkName } = require(`../../utils/js-chunk-names`)
const { formatErrorDetails } = require(`./utils`)
const mod = require(`hash-mod`)(999)

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

// Run query
module.exports = async (queryJob: QueryJob, component: Any) => {
  const { schema, program } = store.getState()

  const graphql = (query, context) =>
    graphqlFunction(schema, query, context, context, context)

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

    report.log(`
The GraphQL query from ${queryJob.componentPath} failed.

${formatErrorDetails(errorDetails)}`)

    // Perhaps this isn't the best way to see if we're building?
    if (program._[0] === `build`) {
      process.exit(1)
    }
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
    // Remove potentially unsafe characters. This increases chances of collisions
    // slightly but it should still be very safe + we get a shorter
    // url vs hex.
    .replace(/[^a-zA-Z0-9-_]/g, ``)

  let dataPath
  if (queryJob.isPage) {
    dataPath = `${generatePathChunkName(queryJob.jsonName)}-${resultHash}`
  } else {
    dataPath = queryJob.hash
  }

  const programType = program._[0]

  if (programType === `develop`) {
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
    let modInt = ``
    // We leave StaticQuery results at public/static/d
    // as the babel plugin has that path hard-coded
    // for importing static query results.
    if (queryJob.isPage) {
      modInt = mod(dataPath).toString()
    }

    // Always write file to public/static/d/ folder.
    const resultPath = path.join(
      program.directory,
      `public`,
      `static`,
      `d`,
      modInt,
      `${dataPath}.json`
    )

    if (queryJob.isPage) {
      dataPath = `${modInt}/${dataPath}`
    }

    await fs.writeFile(resultPath, resultJSON)

    store.dispatch({
      type: `SET_JSON_DATA_PATH`,
      payload: {
        key: queryJob.jsonName,
        value: dataPath,
      },
    })
  }

  return result
}
