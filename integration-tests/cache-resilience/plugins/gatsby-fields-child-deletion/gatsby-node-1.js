exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ChildDeletionForFields`) {
    actions.createNodeField({
      node,
      name: `foo1`,
      value: `bar`,
    })
  }
}
