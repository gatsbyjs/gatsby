const withDefaultOptions = require(`../utils/default-options`)
const { getNodesByType } = require(`gatsby/dist/redux/nodes.js`)
const createMdxNodeWithScope = require(`../utils/mdx-node-with-scope`)

async function createMdxNode(data) {
  data.options = data.options || withDefaultOptions({ plugins: [] })
  data.getNodesByType = data.getNodesByType || getNodesByType
  const nodeWithScope = await createMdxNodeWithScope(data)
  return nodeWithScope.mdxNode
}

module.exports = createMdxNode
