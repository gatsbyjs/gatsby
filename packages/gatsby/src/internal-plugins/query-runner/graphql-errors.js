// @flow

import { print, visit, GraphQLError, getLocation } from "graphql"
import babelCodeFrame from 'babel-code-frame'
import _ from 'lodash'
import report from "../../utils/reporter"

type RelayGraphQLError = Error & { validationErrors?: Object };

// These handle specific errors throw by RelayParser. If an error matches
// you get a pointer to the location in the query that is broken, otherwise
// we show the error and the query.
const handlers = [
  [/Unknown field `(.+)` on type `(.+)`/i, ([name], node) => {
    if (node.kind === `Field` && node.name.value === name) {
      return node.name.loc
    }
    return null
  }],
  [/Unknown argument `(.+)`/i, ([name], node) => {
    if (node.kind === `Argument` && node.name.value === name) {
      return node.name.loc
    }
    return null
  }],
  [/Unknown directive `@(.+)`/i, ([name], node) => {
    if (node.kind === `Directive` && node.name.value === name) {
      return node.name.loc
    }
    return null
  }],
]

function formatFilePath(filePath: string) {
  return `${report.format.bold(`file:`)} ${report.format.blue(filePath)}`
}

function formatError(message: string, filePath: string, codeFrame: string) {
  return report.stripIndent`
    ${message}

      ${formatFilePath(filePath)}
  ` +
  `\n\n${codeFrame}\n`
}

function extractError(error: Error): { message: string, docName: string } {
  const docRegex = /Invariant Violation: RelayParser: (.*). Source: document `(.*)` file:/g
  let matches
  let message = ``, docName = ``
  while ((matches = docRegex.exec(error.toString())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === docRegex.lastIndex) docRegex.lastIndex++
    ;[, message, docName] = matches
  }
  return { message, docName }
}

function findLocation(extractedMessage, def) {
  let location = null
  visit(def, {
    enter(node) {
      if (location) return
      for (let [regex, handler] of handlers) {
        let match = extractedMessage.match(regex)
        if (!match) continue
        if ((location = handler(match.slice(1), node))) break
      }
    },
  })
  return location
}

function getCodeFrame(
  query: string,
  lineNumber?: number,
  column?: number,
) {
  return babelCodeFrame(query, lineNumber, column, {
    linesAbove: 10,
    linesBelow: 10,
  })
}

function getCodeFrameFromRelayError(
  def: any,
  extractedMessage: string,
  error: Error
) {
  let { start, source } = findLocation(extractedMessage, def) || {}
  let query = source ? source.body : print(def)

  // we can't reliably get a location without the location source, since
  // the printed query may differ from the original.
  let { line, column } = source && getLocation(source, start) || {}
  return getCodeFrame(query, line, column)
}

export function multipleRootQueriesError(filePath: string, def: any, otherDef: any) {
  let name = def.name.value
  let otherName = otherDef.name.value
  let unifiedName = `${_.camelCase(name)}And${_.upperFirst(_.camelCase(otherName))}`

  return formatError(
    `Multiple "root" queries found in file: "${name}" and "${otherName}". ` +
    `Only the first ("${otherName}") will be registered.`,
    filePath,
    `  ${report.format.yellow(`Instead of:`)} \n\n` +
    babelCodeFrame(report.stripIndent`
      query ${otherName} {
        bar {
          #...
        }
      }

      query ${name} {
        foo {
          #...
        }
      }
    `) +
    `\n\n  ${report.format.green(`Do:`)} \n\n` +
    babelCodeFrame(report.stripIndent`
      query ${unifiedName} {
        bar {
          #...
        }
        foo {
          #...
        }
      }
    `)
  )
}

export function graphqlValidationError(
  errors: Array<GraphQLError>,
  filePath: string,
  doc: any
): string {
  if (!errors || !errors.length) return ``
  let error = errors[0]
  let { source, locations: [{ line, column }] = [{}] } = error
  let query = source ? source.body : print(doc)

  return formatError(error.message, filePath, getCodeFrame(query, line, column))
}

export function graphqlError(
  namePathMap: Map<string, string>,
  nameDefMap: Map<string, any>,
  error: Error | RelayGraphQLError
) {
  let { message, docName } = extractError(error)
  let filePath = namePathMap.get(docName)

  if (filePath && docName) {
    return formatError(message, filePath, getCodeFrameFromRelayError(nameDefMap.get(docName), message, error))
  }

  message = `There was an error while compiling your site's GraphQL queries. `
  if (error.message.match(/must be an instance of/)) {
    message += `This usually means that more than one instance of 'graphql' is installed ` +
      `in your node_modules. Remove all but the top level one or run \`npm dedupe\` to fix it.`
  }

  return message
}
