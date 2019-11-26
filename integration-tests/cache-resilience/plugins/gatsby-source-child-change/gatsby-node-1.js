exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_childChange`,
    internal: {
      type: `Parent_ChildChange`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
