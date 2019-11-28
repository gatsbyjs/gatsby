exports.onCreateNode = ({
  actions,
  node,
  createNodeId,
  createContentDigest,
}) => {
  if (node.internal.type === `Parent_ChildChangeForTransformer`) {
    const childNode = {
      parent: node.id,
      id: createNodeId(`${node.id} >>> Child`),
      foo: `bar`,
      internal: {
        type: `ChildOfParent_ChildChangeForTransformer`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
