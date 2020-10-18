exports.sourceNodes = async ({ cache, actions }) => {
  const { createNode } = actions
  createNode({
    id: `ADDITION_NODE_1`,
    foo: `bar`,
    internal: {
      type: `Addition`,
      contentDigest: `0`,
    },
  })
}
