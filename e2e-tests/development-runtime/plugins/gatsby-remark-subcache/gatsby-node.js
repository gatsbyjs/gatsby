const { id } = require(`./constants`)

exports.onPreBootstrap = async ({ cache }) => {
  await cache.set(id, `Hello World`)
}
