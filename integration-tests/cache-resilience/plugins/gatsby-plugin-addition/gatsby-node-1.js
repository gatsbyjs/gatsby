const cacheKey = `ADDITION`

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
  if (!(await cache.get(cacheKey))) {
    await cache.set(cacheKey, `value`)
  }
}
