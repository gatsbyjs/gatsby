exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ChildChange`) {
    actions.createNodeField({
      node,
      name: `foo2`,
      value: `baz`,
    })
  }
}
