exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentChange`,
    internal: {
      type: `Parent_ParentChange`,
    },
    bar: `run-2`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
