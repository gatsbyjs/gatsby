exports.onPreInit = async ({ cache }) => {
  await cache.get(`foo`)
}