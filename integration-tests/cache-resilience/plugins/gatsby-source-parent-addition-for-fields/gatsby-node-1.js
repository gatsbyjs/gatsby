exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentAdditionForFields`,
    internal: {
      type: `Parent_ParentAdditionForFields`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
