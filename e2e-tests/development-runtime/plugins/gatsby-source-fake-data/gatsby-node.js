const api = require(`./api`)

exports.onCreateNode = function onCreateNode({ actions, node }) {
  if (node.internal.type === api.nodeType) {
    actions.createNodeField({
      name: `slug`,
      value: `/preview/${node.uuid}`,
      node,
    })
  }
}

exports.sourceNodes = async function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
  getNode,
}) {
  const { createNode, deleteNode } = actions

  const [updated, deleted = []] = await api.sync({
    createNodeId,
    createContentDigest,
  })

  updated.forEach(node => createNode(node))
  deleted.forEach(node => {
    const existing = getNode(node.id)
    if (existing) {
      deleteNode({
        node: existing,
      })
    }
  })
}
