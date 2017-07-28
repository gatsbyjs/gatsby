// @flow
const fs = require(`fs-extra`)
const crypto = require(`crypto`)

// Traverse is a es6 module...
import traverse from "babel-traverse"
const babylon = require(`babylon`)
const { getGraphQLTag } = require(`babel-plugin-remove-graphql-queries`)
const { stripIndent } = require(`common-tags`)


import type { DocumentNode, DefinitionNode } from "graphql"

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
      } catch (e) {
        console.info(e)
        continue
      }
    }
    if (ast === undefined) {
      console.error(`Failed to parse preprocessed file ${filePath}`)
    }
  } else {
    try {
      ast = babylon.parse(fileStr, {
        sourceType: `module`,
        sourceFilename: true,
        plugins: [`*`],
      })
    } catch (e) {
      console.log(`Failed to parse ${filePath}`)
      console.log(e)
    }
  }

  return ast
}

async function findGraphQLTags(file, text): Promise<Array<DefinitionNode>> {
  return new Promise(resolve => {
    parseToAst(file, text).then(ast => {
      if (!ast) {
        resolve([])
        return
      }

      let queries = []
      traverse(ast, {
        ExportNamedDeclaration(path, state) {
          path.traverse({
            TaggedTemplateExpression(innerPath) {
              const gqlAst = getGraphQLTag(innerPath)
              if (gqlAst) {
                gqlAst.definitions.forEach(def => {
                  if (!def.name || !def.name.value) {
                    console.log(stripIndent`
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
                `)
                    process.exit(1)
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
      console.error(`Failed to parse GQL query from file: ${file}`)
      console.error(err.message)
      return null
    }
  }

  async parseFiles(files: Array<string>): Promise<Map<string, DocumentNode>> {
    const documents = new Map()
    return Promise.all(
      files.map(
        file =>
          new Promise(resolve => {
            this.parseFile(file)
              .then(doc => {
                if (doc) documents.set(file, doc)
                resolve()
              })
              .catch(e => {
                console.log(`parsing file failed`, file, e)
              })
          })
      )
    )
      .then(() => documents)
      .catch(e => {
        console.log(`parsing files failed`, e)
      })
  }
}
