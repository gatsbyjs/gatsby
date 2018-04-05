import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const md5 = require(`md5`)
const websocketManager = require(`../../utils/websocket-manager`)

const path = require(`path`)
const { store } = require(`../../redux`)
const { generatePathChunkName } = require(`../../utils/js-chunk-names`)

const resultHashes = {}

// Run query for a page
module.exports = async (pageOrLayout, component) => {
  pageOrLayout.id = pageOrLayout._id
  const { schema, program } = store.getState()

  const graphql = (query, context) =>
    graphqlFunction(schema, query, context, context, context)

  // Run query
  let result

  // Nothing to do if the query doesn't exist.
  if (!component.query || component.query === ``) {
    result = {}
  } else {
    result = await graphql(component.query, {
      ...pageOrLayout,
      ...pageOrLayout.context,
    })
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

  // Add the path/layout context onto the results.
  if (!pageOrLayout.path) {
    result[`layoutContext`] = pageOrLayout.context
  } else {
    result[`pageContext`] = pageOrLayout.context
  }
  const resultJSON = JSON.stringify(result)
  const resultHash = md5(resultJSON)

  if (resultHashes[pageOrLayout.jsonName] !== resultHash) {
    resultHashes[pageOrLayout.jsonName] = resultHash

    // Always write file to public/static/d/ folder.
    const dataPath = `${generatePathChunkName(
      pageOrLayout.jsonName
    )}-${resultHash}`

    const programType = program._[0]

    if (programType === `develop` && pageOrLayout.path) {
      websocketManager.emitData({
        result,
        path: pageOrLayout.path,
      })
    }

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
        [pageOrLayout.jsonName]: dataPath,
      },
    })

    return
  }
}
