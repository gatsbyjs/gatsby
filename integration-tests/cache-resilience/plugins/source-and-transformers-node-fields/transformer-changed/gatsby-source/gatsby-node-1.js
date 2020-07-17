exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childChangeForFields`,
    internal: {
      type: `Parent_ChildChangeForFields`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
