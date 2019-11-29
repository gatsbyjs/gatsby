const fs = require(`fs`)
const v8 = require(`v8`)

const db = require(`gatsby/dist/db`)

const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BOOTSTRAP_FILE_PATH,
} = require(`./utils/constants`)

const createMap = (nodes, createNodeId) => {
  const map = new Map()
  nodes.forEach(node => {
    map.set(node.id, node)
  })
  return map
}

exports.onPreBootstrap = ({ getNodes, createNodeId }) => {
  fs.writeFileSync(
    ON_PRE_BOOTSTRAP_FILE_PATH,
    v8.serialize(createMap(getNodes(), createNodeId))
  )
}

exports.onPostBootstrap = async ({ getNodes, createNodeId }) => {
  fs.writeFileSync(
    ON_POST_BOOTSTRAP_FILE_PATH,
    v8.serialize(createMap(getNodes(), createNodeId))
  )

  await db.saveState()

  if (process.env.EXIT_ON_POST_BOOTSTRAP) {
    process.exit()
  }
}
