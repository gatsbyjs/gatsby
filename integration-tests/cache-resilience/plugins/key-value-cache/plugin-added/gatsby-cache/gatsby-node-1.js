const cacheKey = `TEST`

exports.createPages = async ({ cache }) => {
  if (!(await cache.get(cacheKey))) {
    await cache.set(cacheKey, `value`)
  }
}
