exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentDeletionForTransformer`,
    internal: {
      type: `Parent_ParentDeletionForTransformer`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
