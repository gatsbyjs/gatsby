const stackTrace = require(`stack-trace`)

const GraphQLRunner = require(`../query/graphql-runner`)
const errorParser = require(`../query/error-parser`).default

const { emitter } = require(`../redux`)

module.exports = (store, reporter) => {
  // TODO: Move tracking of changed state inside GraphQLRunner itself. https://github.com/gatsbyjs/gatsby/issues/20941
  let runner = new GraphQLRunner(store)
  ;[
    `DELETE_CACHE`,
    `CREATE_NODE`,
    `DELETE_NODE`,
    `DELETE_NODES`,
    `SET_SCHEMA_COMPOSER`,
    `SET_SCHEMA`,
    `ADD_FIELD_TO_NODE`,
    `ADD_CHILD_NODE_TO_PARENT_NODE`,
  ].forEach(eventType => {
    emitter.on(eventType, event => {
      runner = new GraphQLRunner(store)
    })
  })
  return (query, context) =>
    runner.query(query, context).then(result => {
      if (result.errors) {
        const structuredErrors = result.errors
          .map(e => {
            // Find the file where graphql was called.
            const file = stackTrace
              .parse(e)
              .find(file => /createPages/.test(file.functionName))

            if (file) {
              const structuredError = errorParser({
                message: e.message,
                location: {
                  start: { line: file.lineNumber, column: file.columnNumber },
                },
                filePath: file.fileName,
              })
              structuredError.context = {
                ...structuredError.context,
                fromGraphQLFunction: true,
              }
              return structuredError
            }

            return null
          })
          .filter(Boolean)

        if (structuredErrors.length) {
          // panic on build exits the process
          reporter.panicOnBuild(structuredErrors)
        }
      }

      return result
    })
}
