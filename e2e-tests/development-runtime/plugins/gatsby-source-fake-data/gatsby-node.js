const api = require(`./api`)

const NODE_TYPE = `FakeData`

exports.onCreateNode = function onCreateNode({ actions, node }) {
  if (node.internal.type === NODE_TYPE) {
    actions.createNodeField({
      name: `slug`,
      value: `/preview/${node.uuid}`,
      node,
    })
  }
}

const getNode = (data, { createNodeId, createContentDigest }) => {
  const nodeContent = JSON.stringify(data)

  const meta = {
    id: createNodeId(`fake-data-${data.uuid}`),
    parent: null,
    children: null,
    internal: {
      type: NODE_TYPE,
      content: nodeContent,
      contentDigest: createContentDigest(data),
    },
  }

  return Object.assign({}, data, meta)
}

exports.sourceNodes = function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  const { createNode } = actions
  const helpers = { createNodeId, createContentDigest }

  const nodes = api.get()

  nodes.forEach(node => createNode(getNode(node, helpers)))
}
