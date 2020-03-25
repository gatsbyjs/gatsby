exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ChildAdditionForFields`) {
    actions.createNodeField({
      node,
      name: `foo1`,
      value: `bar`,
    })
  }
}
