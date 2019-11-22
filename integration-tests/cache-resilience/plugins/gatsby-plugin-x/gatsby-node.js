exports.sourceNodes = ({ actions }) => {
  const { createNode } = actions
  createNode({
    id: `TEST_NODE`,
    internal: {
      type: `X`,
      contentDigest: `0`,
    },
  })
}
// Placeholder comment for invalidation// Placeholder comment for invalidation// Placeholder comment for invalidation