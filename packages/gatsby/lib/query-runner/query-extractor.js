const fs = require("fs")
// Traverse is a es6 module...
import traverse from "babel-traverse"
const babylon = require("babylon")
const Promise = require("bluebird")

const apiRunnerNode = require("../utils/api-runner-node")

const readFileAsync = Promise.promisify(fs.readFile)

module.exports = async filePath => {
  let fileStr = await readFileAsync(filePath, `utf-8`)
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

  // Get query for this file.
  let query
  traverse(ast, {
    ExportNamedDeclaration(path, state) {
      // cache declaration node
      const declaration = path.node.declaration.declarations[0]
      // we're looking for a ES6 named export called "pageQuery"
      const name = declaration.id.name
      if (name === `pageQuery`) {
        const type = declaration.init.type
        if (type === `TemplateLiteral`) {
          // most pageQueries will be template strings
          const chunks = []
          for (const quasi of declaration.init.quasis) {
            chunks.push(quasi.value.cooked)
          }
          query = chunks.join(``)
        } else if (type === `StringLiteral`) {
          // fun fact: CoffeeScript can only generate StringLiterals
          query = declaration.init.extra.rawValue
        }
        console.time(`graphql query time`)
      }
    },
  })

  // Trim whitespace
  if (query) {
    query = query.trim()
  } else {
    query = ""
  }

  return query
}
