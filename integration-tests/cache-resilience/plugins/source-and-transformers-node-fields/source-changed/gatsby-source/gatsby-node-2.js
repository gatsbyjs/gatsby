exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentChangeForFields`,
    internal: {
      type: `Parent_ParentChangeForFields`,
    },
    bar: `run-2`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
