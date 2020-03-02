exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ParentChangeForFields`) {
    actions.createNodeField({
      node,
      name: `foo`,
      value: node.foo,
    })

    actions.createNodeField({
      node,
      name: `bar`,
      value: node.bar,
    })
  }
}
