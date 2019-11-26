console.log(`[gatsby-transformer-parent-change] init`)
exports.onCreateNode = ({
  actions,
  node,
  createNodeId,
  createContentDigest,
}) => {
  if (node.internal.type === `Parent_ParentChange`) {
    const childNode = {
      parent: node.id,
      id: createNodeId(`${node.id} >>> Child`),
      foo: node.foo,
      bar: node.bar,
      internal: {
        type: `ChildOfParent_ParentChange`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
