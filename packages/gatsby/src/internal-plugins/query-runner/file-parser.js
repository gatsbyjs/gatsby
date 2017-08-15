// @flow
const fs = require(`fs-extra`)
const crypto = require(`crypto`)

// Traverse is a es6 module...
import traverse from "babel-traverse"
const babylon = require(`babylon`)

const report = require(`../../reporter`)
const { getGraphQLTag } = require(`babel-plugin-remove-graphql-queries`)
const { stripIndent } = require(`common-tags`)

import type { DocumentNode, DefinitionNode } from "graphql"

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

  let transpiled
  // TODO figure out why awaiting apiRunnerNode doesn't work
  // Currently if I try that it just returns immediately.
  //
  // Preprocess and attempt to parse source; return an AST if we can, log an
  // error if we can't.
  // const transpiled = await apiRunnerNode(`preprocessSource`, {
  // filename: filePath,
  // contents: fileStr,
  // })

  if (transpiled && transpiled.length) {
    for (const item of transpiled) {
      try {
        const tmp = babylon.parse(item, {
          sourceType: `module`,
          plugins: [`*`],
        })
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
      ast = babylon.parse(fileStr, {
        sourceType: `module`,
        sourceFilename: true,
        plugins: [`*`],
      })
    } catch (error) {
      report.error(
        `There was a problem parsing "${filePath}"; any GraphQL ` +
          `fragments or queries in this file were not processed. \n` +
          `This may indicate a syntax error in the code, or it may be a file type ` +
          `That Gatsby does not know how to parse.`,
        error
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
    // TODO figure out why fs-extra isn't returning a promise
    const text = fs.readFileSync(file, `utf8`)

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
