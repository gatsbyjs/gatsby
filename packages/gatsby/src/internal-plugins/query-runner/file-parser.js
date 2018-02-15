// @flow
const fs = require(`fs-extra`)
const crypto = require(`crypto`)

// Traverse is a es6 module...
import traverse from "babel-traverse"
const babylon = require(`babylon`)
const getGraphQLTag = require(`babel-plugin-remove-graphql-queries`)
  .getGraphQLTag
const report = require(`gatsby-cli/lib/reporter`)

import type { DocumentNode, DefinitionNode } from "graphql"

const apiRunnerNode = require(`../../utils/api-runner-node`)

const BABYLON_OPTIONS = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  sourceType: `unambigious`,
  sourceFilename: true,
  plugins: [
    `jsx`,
    `flow`,
    `doExpressions`,
    `objectRestSpread`,
    `decorators`,
    `classProperties`,
    `classPrivateProperties`,
    `classPrivateMethods`,
    `exportDefaultFrom`,
    `exportNamespaceFrom`,
    `asyncGenerators`,
    `functionBind`,
    `functionSent`,
    `dynamicImport`,
    `numericSeparator`,
    `optionalChaining`,
    `importMeta`,
    `bigInt`,
    `optionalCatchBinding`,
    `throwExpressions`,
    `pipelineOperator`,
    `nullishCoalescingOperator`,
  ],
}

const getMissingNameErrorMessage = file => report.stripIndent`
  GraphQL definitions must be "named".
  The query with the missing name is in ${file}.
  To fix the query, add "query MyQueryName" to the start of your query.
  So instead of:
    {
      allMarkdownRemark {
        totalCount
      }
    }

  Do:
    query MyQueryName {
      allMarkdownRemark {
        totalCount
      }
    }
`
async function parseToAst(filePath, fileStr) {
  let ast

  // Preprocess and attempt to parse source; return an AST if we can, log an
  // error if we can't.
  const transpiled = await apiRunnerNode(`preprocessSource`, {
    filename: filePath,
    contents: fileStr,
  })

  if (transpiled && transpiled.length) {
    for (const item of transpiled) {
      try {
        const tmp = babylon.parse(item, BABYLON_OPTIONS)
        ast = tmp
        break
      } catch (error) {
        report.error(error)
        continue
      }
    }
    if (ast === undefined) {
      report.error(`Failed to parse preprocessed file ${filePath}`)
    }
  } else {
    try {
      ast = babylon.parse(fileStr, BABYLON_OPTIONS)
    } catch (error) {
      report.error(
        `There was a problem parsing "${filePath}"; any GraphQL ` +
          `fragments or queries in this file were not processed. \n` +
          `This may indicate a syntax error in the code, or it may be a file type ` +
          `That Gatsby does not know how to parse.`
      )
    }
  }

  return ast
}

async function findGraphQLTags(file, text): Promise<Array<DefinitionNode>> {
  return new Promise((resolve, reject) => {
    parseToAst(file, text)
      .then(ast => {
        let queries = []
        if (!ast) {
          resolve(queries)
          return
        }

        traverse(ast, {
          ExportNamedDeclaration(path, state) {
            path.traverse({
              TaggedTemplateExpression(innerPath) {
                const gqlAst = getGraphQLTag(innerPath)
                if (gqlAst) {
                  gqlAst.definitions.forEach(def => {
                    if (!def.name || !def.name.value) {
                      report.panic(getMissingNameErrorMessage(file))
                    }
                  })

                  queries.push(...gqlAst.definitions)
                }
              },
            })
          },
        })
        resolve(queries)
      })
      .catch(reject)
  })
}

const cache = {}

export default class FileParser {
  async parseFile(file: string): Promise<?DocumentNode> {
    let text
    try {
      text = await fs.readFile(file, `utf8`)
    } catch (err) {
      report.error(`There was a problem reading the file: ${file}`, err)
      return null
    }

    if (text.indexOf(`graphql`) === -1) return null
    const hash = crypto
      .createHash(`md5`)
      .update(file)
      .update(text)
      .digest(`hex`)

    try {
      let astDefinitions =
        cache[hash] || (cache[hash] = await findGraphQLTags(file, text))

      return astDefinitions.length
        ? {
            kind: `Document`,
            definitions: astDefinitions,
          }
        : null
    } catch (err) {
      report.error(
        `There was a problem parsing the GraphQL query in file: ${file}`,
        err
      )
      return null
    }
  }

  async parseFiles(files: Array<string>): Promise<Map<string, DocumentNode>> {
    const documents = new Map()

    return Promise.all(
      files.map(file =>
        this.parseFile(file).then(doc => {
          if (!doc) return
          documents.set(file, doc)
        })
      )
    ).then(() => documents)
  }
}
