import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const md5 = require(`md5`)

const { joinPath } = require(`../../utils/path`)
const { store } = require(`../../redux`)

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
  // console.log(`running query`, component.pathname, component.query, result)

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
  const resultPath = joinPath(
    program.directory,
    `.cache`,
    `json`,
    pageOrLayout.jsonName
  )

  if (resultHashes[resultPath] !== resultHash) {
    resultHashes[resultPath] = resultHash
    await fs.writeFile(resultPath, resultJSON)
  }
}
