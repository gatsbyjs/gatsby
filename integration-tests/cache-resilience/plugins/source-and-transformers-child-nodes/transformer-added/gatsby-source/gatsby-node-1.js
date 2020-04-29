exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childAdditionForTransformer`,
    internal: {
      type: `Parent_ChildAdditionForTransformer`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
