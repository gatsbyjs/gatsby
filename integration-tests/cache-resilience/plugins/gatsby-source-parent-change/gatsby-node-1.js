exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentChange`,
    internal: {
      type: `Parent_ParentChange`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
