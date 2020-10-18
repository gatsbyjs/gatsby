exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childDeletionForFields`,
    internal: {
      type: `Parent_ChildDeletionForFields`,
    },
    foo: `bar`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
