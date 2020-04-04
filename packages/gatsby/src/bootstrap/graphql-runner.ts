import * as stackTrace from "stack-trace"

import GraphQLRunner from "../query/graphql-runner"
import errorParser from "../query/error-parser"

import { emitter } from "../redux"

const actions: string[] = [
  `DELETE_CACHE`,
  `CREATE_NODE`,
  `DELETE_NODE`,
  `DELETE_NODES`,
  `SET_SCHEMA_COMPOSER`,
  `SET_SCHEMA`,
  `ADD_FIELD_TO_NODE`,
  `ADD_CHILD_NODE_TO_PARENT_NODE`,
]

export default function (store, reporter): (query: string, context: any) => any {
  // TODO: Move tracking of changed state inside GraphQLRunner itself. https://github.com/gatsbyjs/gatsby/issues/20941
  let runner = new GraphQLRunner(store)

  actions.forEach(function callbackFn(eventType: string): void {
    emitter.on(eventType, function handler() {
      runner = new GraphQLRunner(store)
    })
  })

  return function inner(query: string, context: any): any {
    return runner.query(query, context).then(function onfulfilled(result) {
      if (result.errors) {
        const structuredErrors = result.errors
          .map(function callbackFn(error) {
            // Find the file where graphql was called.
            const file = stackTrace.parse(error).find(function predicate(file) {
              return /createPages/.test(file.functionName)
            })

            if (file) {
              const structuredError = errorParser({
                message: error.message,
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
}
