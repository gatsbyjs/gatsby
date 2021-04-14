const cacheKey = `TEST-OTHER-KEY`

exports.createPages = async ({ cache }) => {
  if (!(await cache.get(cacheKey))) {
    await cache.set(cacheKey, `other value`)
  }
}
