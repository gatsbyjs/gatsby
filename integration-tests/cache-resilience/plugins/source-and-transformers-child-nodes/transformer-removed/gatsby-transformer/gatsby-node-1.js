exports.onCreateNode = ({ actions, node, createContentDigest }) => {
  if (node.internal.type === `Parent_ChildDeletionForTransformer`) {
    const childNode = {
      parent: node.id,
      id: `${node.id} >>> Child`,
      foo: `bar`,
      internal: {
        type: `ChildOfParent_ChildDeletionForTransformer`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
