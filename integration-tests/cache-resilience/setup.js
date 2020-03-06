const fs = require(`fs-extra`)
const path = require(`path`)

const useGatsbyNode = run => {
  const r = fs.readdirSync(`plugins`)
  r.forEach(pluginName => {
    const inputPath = path.join(`plugins`, pluginName, `gatsby-node-${run}.js`)
    if (fs.existsSync(inputPath)) {
      fs.copyFileSync(
        inputPath,
        path.join(`plugins`, pluginName, `gatsby-node.js`)
      )
    }
  })
}

const useGatsbyConfig = run => {
  fs.copyFileSync(`gatsby-config-${run}.js`, path.join(`gatsby-config.js`))
}

const writeQueryFile = (pluginName, query, result, run) => {
  const inputPath = path.join(`plugins`, pluginName, `query-${run}.js`)

  const content = `
module.exports = {
  query: \`
    ${query}
  \`,
  expectedResult: {
    data: ${result},
  },
}`
  fs.writeFileSync(inputPath, content)
}

const useGatsbyQuery = run => {
  const r = fs.readdirSync(`plugins`)
  return r.reduce((acc, pluginName) => {
    const inputPath = path.join(`plugins`, pluginName, `query-${run}.js`)
    if (fs.existsSync(inputPath)) {
      const pagePath = path.join(
        `plugins`,
        pluginName,
        `src`,
        `pages`,
        `${pluginName}.js`
      )

      const { query, expectedResult } = require(path.join(
        process.cwd(),
        inputPath
      ))

      const content = query
        ? `
      import { graphql } from "gatsby"
export default () => null

export const query = graphql\`
  ${query}
\`
      `
        : `export default () => null`

      fs.outputFileSync(pagePath, content)

      acc[pluginName] = expectedResult
      // fs.copyFileSync(
      //   inputPath,
      //   path.join(`plugins`, pluginName, `gatsby-node.js`)
      // )
    }
    return acc
  }, {})
}

const PLUGIN_NAME = `gatsby-transformer-parent-deletion`
const QUERY = `
{
  allParentParentDeletionForTransformer {
    nodes {
      foo
      id
      parent {
        id
      }
      children {
        id
      }
      childChildOfParentParentDeletionForTransformer {
        foo
        id
        parent {
          id
        }
        children {
          id
        }
      }
    }
  }
}
`
const RESULT = `
{
  "data": {
    "allParentParentDeletionForTransformer": {
      "nodes": [
        {
          "foo": "run-1",
          "id": "parent_parentDeletionForTransformer",
          "parent": null,
          "children": [
            {
              "id": "parent_parentDeletionForTransformer >>> Child"
            }
          ],
          "childChildOfParentParentDeletionForTransformer": {
            "foo": "run-1",
            "id": "parent_parentDeletionForTransformer >>> Child",
            "parent": {
              "id": "parent_parentDeletionForTransformer"
            },
            "children": []
          }
        }
      ]
    }
  }
}
`

const useRun = run => {
  useGatsbyNode(run)
  useGatsbyConfig(run)
  useGatsbyQuery(run)
}

console.log(`Setting up for Run ${process.argv[2]}`)
useRun(process.argv[2])

// writeQueryFile(PLUGIN_NAME, QUERY, RESULT, 1)
