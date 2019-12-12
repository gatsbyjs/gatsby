const fs = require(`fs-extra`)
const path = require(`path`)

// const useGatsbyNode = run => {
//   const r = fs.readdirSync(`plugins`)
//   r.forEach(pluginName => {
//     const inputPath = path.join(`plugins`, pluginName, `gatsby-node-${run}.js`)
//     if (fs.existsSync(inputPath)) {
//       fs.copyFileSync(
//         inputPath,
//         path.join(`plugins`, pluginName, `gatsby-node.js`)
//       )
//     }
//   })
// }

// const useGatsbyConfig = run => {
//   fs.copyFileSync(`gatsby-config-${run}.js`, path.join(`gatsby-config.js`))
// }

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

// useGatsbyNode(1)
// useGatsbyConfig(1)

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

writeQueryFile(PLUGIN_NAME, QUERY, RESULT, 1)
