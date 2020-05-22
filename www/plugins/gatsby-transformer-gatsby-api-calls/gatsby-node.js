const findApiCalls = require(`./find-api-calls`)
const minimatch = require(`minimatch`)

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

exports.onCreateNode = async ({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  if (
    node.internal.type !== `File` ||
    node.sourceInstanceName !== `packages` ||
    node.extension !== `js` ||
    !minimatch(node.relativePath, `gatsby/**`) ||
    ignorePatterns.some(ignorePattern =>
      minimatch(node.relativePath, ignorePattern)
    )
  ) {
    return
  }

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

      actions.createNode(apiCallNode)
      actions.createParentChildLink({ parent: node, child: apiCallNode })
    })
  }
}
