const withDefaultOptions = require(`../utils/default-options`)
const { getNodesByType } = require(`gatsby/dist/redux/nodes.js`)
const createMdxNodeWithScope = require(`../utils/mdx-node-with-scope`)

async function createMdxNodeLegacy({ id, node, content } = {}) {
  const nodeWithScope = await createMdxNodeWithScope({
    id,
    node,
    content,
    getNodesByType,
    options: withDefaultOptions({ plugins: [] }),
  })
  return nodeWithScope.mdxNode
}

// This function is deprecated in favor of createMDXNodeWithScope and slated to be dropped in v3
module.exports = createMdxNodeLegacy
