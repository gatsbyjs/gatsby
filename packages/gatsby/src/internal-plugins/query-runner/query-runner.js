import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs`)
const Promise = require(`bluebird`)

const openFileAsync = Promise.promisify(fs.open)
const writeFileAsync = Promise.promisify(fs.write)
const { joinPath } = require(`../../utils/path`)
const report = require(`../../reporter`)

const { store } = require(`../../redux`)

// Run query for a page
module.exports = async (pageOrLayout, component) => {
  const { schema, program } = store.getState()

  const graphql = (query, context) =>
    graphqlFunction(schema, query, context, context, context)

  // Run query
  let result

  // Nothing to do if the query doesn't exist.
  if (!component || !component.query || component.query === ``) {
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
    console.log(``)
    console.log(``)
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

  // Add the path/layout context onto the results.
  let contextKey = `pathContext`
  if (!pageOrLayout.path) {
    contextKey = `layoutContext`
  }
  result[contextKey] = pageOrLayout.context
  const jsonPath = joinPath(program.directory, `.cache`, `json`, pageOrLayout.jsonName)

  if (pageOrLayout.isLayout) {
    return openFileAsync(jsonPath, 'w')
      .then(fd => {
        const resultJSON = JSON.stringify(result, null, 4)
        return writeFileAsync(fd, resultJSON)
          .then(buffer => {
            return
          })
          .catch(error => {
            throw error
          })
      })
      .catch(error => {
        throw error
      })
  } else {
    return openFileAsync(jsonPath, 'w+')
      .then(fd => {
        let resultCombined = {}
        resultCombined[component.componentChunkName] = result
        const resultJSON = JSON.stringify(resultCombined, null, 4)
        return writeFileAsync(fd, resultJSON)
          .then(buffer => {
            return
          })
          .catch(error => {
            throw error
          })
      })
      .catch(error => {
        if (err.code === 'EEXIST') {
            let jsonExistBuffer
            fs.readSync(fd, jsonExistBuffer)
            const existingJSON = JSON.parse(jsonExistBuffer)
            let resultCombined = existingJSON
            resultCombined[component.componentChunkName] = result
            const resultJSON = JSON.stringify(resultCombined, null, 4)
            return writeFileAsync(fd, resultJSON)
              .then(buffer => {
                return
              })
              .catch(error => {
                throw error
              })
        } else {throw err}
      })
    }
}
