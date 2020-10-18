exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentChangeForTransformer`,
    internal: {
      type: `Parent_ParentChangeForTransformer`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
