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
  reporter,
  webhookBody,
}) {
  const { createNode, deleteNode } = actions

  const helpers = {
    createNodeId,
    createContentDigest,
  }

  if (webhookBody && webhookBody.items) {
    reporter.info(`Webhook data detected; creating nodes`)
    webhookBody.items.forEach(node =>
      createNode(api.addNode(api.getNode(node, helpers)))
    )
  } else {
    if (!(webhookBody && webhookBody[`fake-data-update`])) {
      await api.reset()
    }
    const [updated, deleted = []] = await api.sync(helpers)

    updated.forEach(node => createNode(node))
    deleted.forEach(node => {
      const existing = getNode(node.id)
      if (existing) {
        deleteNode(existing)
      }
    })
  }
}
