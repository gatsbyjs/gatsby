// @flow
const fs = require(`fs`)
const crypto = require(`crypto`)

// Traverse is a es6 module...
import traverse from "babel-traverse"
const babylon = require(`babylon`)
const Bluebird = require(`bluebird`)

const apiRunnerNode = require(`../../utils/api-runner-node`)
const { getGraphQLTag } = require(`../../utils/babel-plugin-extract-graphql`)

import type { DocumentNode, DefinitionNode } from "graphql"

const readFileAsync = Bluebird.promisify(fs.readFile)

async function parseToAst(filePath, fileStr) {
  let ast

  // Preprocess and attempt to parse source; return an AST if we can, log an
  // error if we can't.
  const transpiled = await apiRunnerNode(`preprocessSource`, {
    filename: filePath,
    contents: fileStr,
  })

  if (transpiled.length) {
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
  let ast = await parseToAst(file, text)
  if (!ast) return []

  let queries = []
  traverse(ast, {
    ExportNamedDeclaration(path, state) {
      path.traverse({
        TaggedTemplateExpression(innerPath) {
          const gqlAst = getGraphQLTag(innerPath)
          if (gqlAst) {
            gqlAst.definitions.forEach(def => {
              if (!def.name || !def.name.value) {
                console.log(
                  `
GraphQL definitions must be "named"`
                )

                console.log(`The query with the missing name is in ${file}`)
                console.log(
                  `
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
                )
                console.log(``)
                process.exit(1)
              }
            })

            queries.push(...gqlAst.definitions)
          }
        },
      })
    },
  })
  return queries
}

const cache = {}

export default class FileParser {
  async parseFile(file: string): Promise<?DocumentNode> {
    const text = await readFileAsync(file, `utf8`)

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
    for (let file of files) {
      const doc = await this.parseFile(file)

      if (doc) documents.set(file, doc)
    }

    return documents
  }
}
