exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childChangeForTransformer`,
    internal: {
      type: `Parent_ChildChangeForTransformer`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
