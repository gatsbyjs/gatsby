exports.sourceNodes = async ({ cache, actions }) => {
  const { createNode } = actions
  createNode({
    id: `DELETION_NODE_1`,
    foo: `bar`,
    internal: {
      type: `Deletion`,
      contentDigest: `0`,
    },
  })
}
