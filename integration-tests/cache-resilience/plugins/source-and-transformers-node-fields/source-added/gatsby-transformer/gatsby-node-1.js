exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ParentAdditionForFields`) {
    actions.createNodeField({
      node,
      name: `foo`,
      value: node.foo,
    })
  }
}
