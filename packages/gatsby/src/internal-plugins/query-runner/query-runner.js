// @flow

import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const websocketManager = require(`../../utils/websocket-manager`)

const path = require(`path`)
const { store } = require(`../../redux`)
const { generatePathChunkName } = require(`../../utils/js-chunk-names`)

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
    report.log(
      report.stripIndent`
        The GraphQL query from ${component.componentPath} failed

        Errors:
          ${result.errors || []}
        Query:
          ${component.query}
      `
    )

    // Perhaps this isn't the best way to see if we're building?
    if (program._name === `build`) {
      process.exit(1)
    }
  }

  // Add the page context onto the results.
  if (queryJob?.isPage) {
    result[`pageContext`] = queryJob.context
  }

  const resultJSON = JSON.stringify(result)
  const resultHash = require("crypto")
    .createHash("sha1")
    .update(resultJSON)
    .digest("base64")
    // Remove potentially unsafe characters. This increases chances of collisions
    // slightly but it should still be very safe + we get a shorter
    // url vs hex.
    .replace(/[^a-zA-Z0-9-_]/g, "")

  let dataPath
  if (queryJob?.isPage) {
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

    // Always write file to public/static/d/ folder.
    const resultPath = path.join(
      program.directory,
      `public`,
      `static`,
      `d`,
      `${dataPath}.json`
    )

    await fs.writeFile(resultPath, resultJSON)

    store.dispatch({
      type: `SET_JSON_DATA_PATH`,
      payload: {
        [queryJob.jsonName]: dataPath,
      },
    })

    return
  }
}
