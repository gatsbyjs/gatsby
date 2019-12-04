const cacheKey = `TEST`

exports.sourceNodes = async ({ cache }) => {
  if (!(await cache.get(cacheKey))) {
    await cache.set(cacheKey, `other value`)
  }
}
