exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentAdditionForTransformer`,
    internal: {
      type: `Parent_ParentAdditionForTransformer`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
