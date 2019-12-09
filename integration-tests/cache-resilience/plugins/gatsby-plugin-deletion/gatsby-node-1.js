const cacheKey = `DELETION`

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
  if (!(await cache.get(cacheKey))) {
    await cache.set(cacheKey, `value`)
  }
}
