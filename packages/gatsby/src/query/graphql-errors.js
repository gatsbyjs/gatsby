// @flow

import { print, visit, getLocation } from "graphql"
import { codeFrameColumns } from "@babel/code-frame"
import _ from "lodash"
import report from "gatsby-cli/lib/reporter"

type RelayGraphQLError = Error & { validationErrors?: Object }

// These handle specific errors throw by RelayParser. If an error matches
// you get a pointer to the location in the query that is broken, otherwise
// we show the error and the query.
const handlers = [
  [
    /Unknown field `(.+)` on type `(.+)`/i,
    ([name], node) => {
      if (node.kind === `Field` && node.name.value === name) {
        return node.name.loc
      }
      return null
    },
  ],
  [
    /Unknown argument `(.+)`/i,
    ([name], node) => {
      if (node.kind === `Argument` && node.name.value === name) {
        return node.name.loc
      }
      return null
    },
  ],
  [
    /Unknown directive `@(.+)`/i,
    ([name], node) => {
      if (node.kind === `Directive` && node.name.value === name) {
        return node.name.loc
      }
      return null
    },
  ],
]

function formatFilePath(filePath: string) {
  return `${report.format.bold(`file:`)} ${report.format.blue(filePath)}`
}

function formatError(message: string, filePath: string, codeFrame: string) {
  return (
    report.stripIndent`
    ${message}

      ${formatFilePath(filePath)}
  ` + `\n\n${codeFrame}\n`
  )
}

function extractError(error: Error): { message: string, docName: string } {
  const docRegex = /Error:.(RelayParser|GraphQLParser):(.*)Source: document.`(.*)`.file.*(GraphQL.request.*^\s*$)/gms
  let matches
  let message = ``
  let docName = ``
  let codeBlock = ``
  while ((matches = docRegex.exec(error.toString())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === docRegex.lastIndex) docRegex.lastIndex++
    ;[, , message, docName, codeBlock] = matches
  }

  if (!message) {
    message = error.toString()
  }

  message = message.trim()

  return { message, codeBlock, docName }
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

function getCodeFrame(query: string, line?: number, column?: number) {
  return codeFrameColumns(
    query,
    {
      start: {
        line,
        column,
      },
    },
    {
      linesAbove: 10,
      linesBelow: 10,
    }
  )
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
  let { line, column } = (source && getLocation(source, start)) || {}
  return getCodeFrame(query, line, column)
}

export function multipleRootQueriesError(
  filePath: string,
  def: any,
  otherDef: any
) {
  let name = def.name.value
  let otherName = otherDef.name.value
  let unifiedName = `${_.camelCase(name)}And${_.upperFirst(
    _.camelCase(otherName)
  )}`

  return {
    id: `85910`,
    filePath,
    context: {
      name,
      otherName,
      beforeCodeFrame: codeFrameColumns(
        report.stripIndent`
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
      `,
        {
          start: {
            column: 0,
            line: 0,
          },
        },
        {
          linesBelow: Number.MAX_SAFE_INTEGER,
        }
      ),
      afterCodeFrame: codeFrameColumns(
        report.stripIndent`
        query ${unifiedName} {
          bar {
            #...
          }
          foo {
            #...
          }
        }
      `,
        {
          start: {
            column: 0,
            line: 0,
          },
        },
        {
          linesBelow: Number.MAX_SAFE_INTEGER,
        }
      ),
    },
  }
}

export function graphqlError(
  namePathMap: Map<string, string>,
  nameDefMap: Map<string, any>,
  error: Error | RelayGraphQLError
) {
  let codeBlock
  let { message, docName } = extractError(error)
  let filePath = namePathMap.get(docName)

  if (filePath && docName) {
    codeBlock = getCodeFrameFromRelayError(
      nameDefMap.get(docName),
      message,
      error
    )
    const formattedMessage = formatError(message, filePath, codeBlock)
    return { formattedMessage, docName, message, codeBlock }
  }

  let reportedMessage = `There was an error while compiling your site's GraphQL queries.
  ${message || error.message}
    `

  if (error.message.match(/must be an instance of/)) {
    reportedMessage +=
      `This usually means that more than one instance of 'graphql' is installed ` +
      `in your node_modules. Remove all but the top level one or run \`npm dedupe\` to fix it.`
  }

  if (error.message.match(/Duplicate document/)) {
    reportedMessage += `${error.message.slice(21)}\n`
  }

  return { formattedMessage: reportedMessage, docName, message, codeBlock }
}
