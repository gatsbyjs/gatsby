const withDefaultOptions = require(`../utils/default-options`)
const { getNodesByType } = require(`gatsby/dist/redux/nodes.js`)
const createMdxNodeWithScope = require(`../utils/mdx-node-with-scope`)

async function createMdxNodeLegacy({ id, node, content }) {
  const data = {
    id,
    rawInput: content,
    absolutePath: node.absolutePath,
    getNodesByType,
    options: withDefaultOptions({ plugins: [] }),
  }
  const nodeWithScope = await createMdxNodeWithScope(data)
  return nodeWithScope.mdxNode
}

// This function is deprecated in favor of createMDXNodeWithScope and slated to be dropped in v3
module.exports = createMdxNodeLegacy
