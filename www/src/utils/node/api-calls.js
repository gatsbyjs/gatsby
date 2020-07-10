const minimatch = require(`minimatch`)
const findApiCalls = require(`../find-api-calls`)

// Create nodes for calls to Gatsby APIs to be consumed by the docs
// TODO this should be it's own standalone plugin

const ignorePatterns = [
  `**/commonjs/**`,
  `**/node_modules/**`,
  `**/__tests__/**`,
  `**/dist/**`,
  `**/__mocks__/**`,
  `babel.config.js`,
  `graphql.js`,
  `**/flow-typed/**`,
]

function isCodeFile(node) {
  return (
    node.internal.type === `File` &&
    node.sourceInstanceName === `gatsby-core` &&
    [`js`].includes(node.extension) &&
    !ignorePatterns.some(ignorePattern =>
      minimatch(node.relativePath, ignorePattern)
    )
  )
}

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  createTypes(/* GraphQL */ `
    type GatsbyAPICall implements Node @derivedTypes @dontInfer {
      name: String
      file: String
      group: String
      codeLocation: GatsbyAPICallCodeLocation
    }

    type GatsbyAPICallCodeLocation @dontInfer {
      filename: Boolean
      end: GatsbyAPICallEndpoint
      start: GatsbyAPICallEndpoint
    }

    type GatsbyAPICallEndpoint @dontInfer {
      column: Int
      line: Int
    }
  `)
}

exports.onCreateNode = async ({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode, createParentChildLink } = actions

  if (isCodeFile(node)) {
    const calls = await findApiCalls({ node, loadNodeContent })
    if (calls.length > 0) {
      calls.forEach(call => {
        const apiCallNode = {
          id: createNodeId(`findApiCalls-${JSON.stringify(call)}`),
          parent: node.id,
          children: [],
          ...call,
          internal: {
            type: `GatsbyAPICall`,
          },
        }
        apiCallNode.internal.contentDigest = createContentDigest(apiCallNode)

        createNode(apiCallNode)
        createParentChildLink({ parent: node, child: apiCallNode })
      })
    }
  }
}
