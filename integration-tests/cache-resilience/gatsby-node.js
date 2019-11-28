const fs = require(`fs`)
const v8 = require(`v8`)

const db = require(`gatsby/dist/db`)

const createMap = nodes => {
  const map = new Map()
  nodes.forEach(node => {
    map.set(node.id, node)
  })
  return map
}

exports.onPreBootstrap = ({ getNodes }) => {
  fs.writeFileSync(
    `./on_pre_bootstrap.state`,
    v8.serialize(createMap(getNodes()))
  )
}

exports.onPostBootstrap = async ({ getNodes }) => {
  fs.writeFileSync(
    `./on_post_bootstrap.state`,
    v8.serialize(createMap(getNodes()))
  )

  await db.saveState()

  if (process.env.EXIT_ON_POST_BOOTSTRAP) {
    process.exit()
  }
}
