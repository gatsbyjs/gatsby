exports.sourceNodes = ({ actions }) => {
  const { createNode } = actions
  createNode({
    id: `STABLE_NODE_1`,
    foo: `bar`,
    internal: {
      type: `IndependentStable`,
      contentDigest: `0`,
    },
  })
}
