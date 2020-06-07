exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentAdditionForFields`,
    internal: {
      type: `Parent_ParentAdditionForFields`,
    },
    foo: `bar`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
