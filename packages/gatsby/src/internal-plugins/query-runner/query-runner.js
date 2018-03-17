import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs-extra`)
const report = require(`gatsby-cli/lib/reporter`)
const md5 = require(`md5`)
const ws = require(`../../utils/websocket`)

const path = require(`path`)
const slash = require(`slash`)
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

  if (resultHashes[pageOrLayout.jsonName] !== resultHash) {
    resultHashes[pageOrLayout.jsonName] = resultHash
    const programType = program._[0]

    // In production, write file to public/static/d/ folder.
    if (programType === `build`) {
      const dataPath = slash(
        path.join(
          `static`,
          `d`,
          `${generatePathChunkName(pageOrLayout.jsonName)}-${resultHash}.json`
        )
      )

      const resultPath = path.join(program.directory, `public`, dataPath)
      await fs.writeFile(resultPath, resultJSON)

      if (!pageOrLayout.path) {
        store.dispatch({
          type: `SET_LAYOUT_DATA_PATH`,
          payload: {
            id: pageOrLayout.id,
            dataPath,
          },
        })
      } else {
        store.dispatch({
          type: `SET_PAGE_DATA_PATH`,
          payload: {
            path: pageOrLayout.path,
            dataPath,
          },
        })
      }

      return
    }

    // In development queue up results until a client is available
    // push subsequent results to client
    if (programType === `develop`) {
      const result = {}
      result[pageOrLayout.jsonName] = resultJSON
      ws.pushResult(result)
      const sockets = ws.instance()
      if (sockets) {
        sockets.emit(`queryResult`, result)
      }
    }
  }
}
