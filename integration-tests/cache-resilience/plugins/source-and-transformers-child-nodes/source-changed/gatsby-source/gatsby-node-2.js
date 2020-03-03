exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentChangeForTransformer`,
    internal: {
      type: `Parent_ParentChangeForTransformer`,
    },
    bar: `run-2`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
