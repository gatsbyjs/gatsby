exports.sourceNodes = ({ actions, createContentDigest }) => {
  const node = {
    id: `parent_parentChangeForFields`,
    internal: {
      type: `Parent_ParentChangeForFields`,
    },
    foo: `run-1`,
  }

  node.internal.contentDigest = createContentDigest(node)
  actions.createNode(node)
}
