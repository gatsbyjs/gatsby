exports.onCreateNode = ({
  actions,
  node,
  createNodeId,
  createContentDigest,
}) => {
  if (node.internal.type === `Parent_ParentChangeForTransformer`) {
    const childNode = {
      parent: node.id,
      id: createNodeId(`${node.id} >>> Child`),
      foo: node.foo,
      bar: node.bar,
      internal: {
        type: `ChildOfParent_ParentChangeForTransformer`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
