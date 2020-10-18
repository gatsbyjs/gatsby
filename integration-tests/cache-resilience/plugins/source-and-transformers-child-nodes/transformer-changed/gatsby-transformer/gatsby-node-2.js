exports.onCreateNode = ({ actions, node, createContentDigest }) => {
  if (node.internal.type === `Parent_ChildChangeForTransformer`) {
    const childNode = {
      parent: node.id,
      id: `${node.id} >>> Child`,
      foo: `baz`,
      second: `run`,
      internal: {
        type: `ChildOfParent_ChildChangeForTransformer`,
      },
    }

    childNode.internal.contentDigest = createContentDigest(childNode)

    actions.createNode(childNode)
    actions.createParentChildLink({ parent: node, child: childNode })
  }
}
