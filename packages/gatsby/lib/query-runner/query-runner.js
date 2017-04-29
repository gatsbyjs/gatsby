import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs`)
const Promise = require(`bluebird`)

const writeFileAsync = Promise.promisify(fs.writeFile)

const { store } = require(`../redux`)

// Run query for a page
module.exports = async (page, component) => {
  const { schema, program } = store.getState()

  const graphql = (query, context) => {
    return graphqlFunction(schema, query, context, context, context)
  }

  // Run query
  let result

  // Nothing to do if the query isn't correct.
  if (!component.query || component.query === ``) {
    result = {}
  } else {
    result = await graphql(component.query, { ...page, ...page.context })
  }

  // Add the path context onto the results.
  result.pathContext = page.context
  const resultJSON = JSON.stringify(result, null, 4)
  return await writeFileAsync(
    `${program.directory}/.cache/json/${page.jsonName}`,
    resultJSON
  )
}
