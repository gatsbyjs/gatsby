exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentAdditionForTransformer`,
    internal: {
      type: `Parent_ParentAdditionForTransformer`,
    },
    foo: `bar`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
