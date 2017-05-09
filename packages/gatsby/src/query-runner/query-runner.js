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

  // If there's an error log the error. If we're building, also quit.
  if (result && result.errors) {
    console.log(``)
    console.log(`The GraphQL query from ${component.componentPath} failed`)
    console.log(``)
    console.log(`Query:`)
    console.log(component.query)
    console.log(``)
    console.log(`GraphQL Error:`)
    console.log(result.errors)
    // Perhaps this isn't the best way to see if we're building?
    if (program._name === `build`) {
      process.exit(1)
    }
  }

  // Add the path context onto the results.
  result.pathContext = page.context
  const resultJSON = JSON.stringify(result, null, 4)
  return await writeFileAsync(
    `${program.directory}/.cache/json/${page.jsonName}`,
    resultJSON
  )
}
