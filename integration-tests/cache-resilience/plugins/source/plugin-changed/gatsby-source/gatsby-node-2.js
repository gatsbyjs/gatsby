exports.sourceNodes = ({ actions }) => {
  const { createNode } = actions
  createNode({
    id: `INDEPENDENT_NODE_1`,
    foo: `baz`,
    internal: {
      type: `IndependentChanging`,
      contentDigest: `0`,
    },
  })
}
