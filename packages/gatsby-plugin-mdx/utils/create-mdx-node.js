const withDefaultOptions = require(`../utils/default-options`)
const { getNodesByType } = require(`gatsby/dist/redux/nodes.js`)
const createMdxNodeWithScope = require(`../utils/mdx-node-with-scope`)

async function createMdxNodeLegacy(data) {
  data.options = data.options || withDefaultOptions({ plugins: [] })
  data.getNodesByType = data.getNodesByType || getNodesByType
  const nodeWithScope = await createMdxNodeWithScope(data)
  return nodeWithScope.mdxNode
}

// This function is deprecated in favor of createMDXNodeWithScope and slated to be dropped in v3
module.exports = createMdxNodeLegacy
