exports.onCreateNode = ({
  actions,
  node,
  createNodeId,
  createContentDigest,
}) => {
  if (node.internal.type === `Parent_ChildChange`) {
    const childNode = {
      parent: node.id,
      id: createNodeId(`${node.id} >>> Child`),
      foo: `baz`,
      internal: {
        type: `ChildOfParent_ChildChange`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
