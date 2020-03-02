exports.onCreateNode = ({ actions, node, createContentDigest }) => {
  if (node.internal.type === `Parent_ParentAdditionForTransformer`) {
    const childNode = {
      parent: node.id,
      id: `${node.id} >>> Child`,
      foo: node.foo,
      bar: node.bar,
      internal: {
        type: `ChildOfParent_ParentAdditionForTransformer`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
