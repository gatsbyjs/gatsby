exports.onCreateNode = ({ actions, node }) => {
  if (node.internal.type === `Parent_ChildChangeForFields`) {
    actions.createNodeField({
      node,
      name: `foo1`,
      value: `bar`,
    })
  }
}

exports.onCreateNode.pageQueryFixtureInput = [
  {
    typename: `Parent_ChildChangeForFields`,
    haveFields: [`fields.foo1`],
    dontHaveFields: [`fields.foo2`],
  },
]
