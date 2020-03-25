exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childDeletionForTransformer`,
    internal: {
      type: `Parent_ChildDeletionForTransformer`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
