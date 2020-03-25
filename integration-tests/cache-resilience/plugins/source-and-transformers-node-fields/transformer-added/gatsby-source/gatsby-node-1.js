exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childAdditionForFields`,
    internal: {
      type: `Parent_ChildAdditionForFields`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
