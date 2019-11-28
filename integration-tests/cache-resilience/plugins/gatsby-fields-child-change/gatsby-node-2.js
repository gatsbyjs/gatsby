exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ChildChangeForFields`) {
    actions.createNodeField({
      node,
      name: `foo2`,
      value: `baz`,
    })
  }
}
