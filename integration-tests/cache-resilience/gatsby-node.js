const fs = require(`fs`)
const v8 = require(`v8`)

const db = require(`gatsby/dist/db`)

const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BOOTSTRAP_FILE_PATH,
} = require(`./utils/constants`)

const createMap = nodes => {
  const map = new Map()
  nodes
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach(node => {
      map.set(node.id, node)
    })
  return map
}

exports.onPreBootstrap = ({ getNodes }) => {
  fs.writeFileSync(
    ON_PRE_BOOTSTRAP_FILE_PATH,
    v8.serialize(createMap(getNodes()))
  )
}

exports.onPostBootstrap = async ({ getNodes }) => {
  fs.writeFileSync(
    ON_POST_BOOTSTRAP_FILE_PATH,
    v8.serialize(createMap(getNodes()))
  )

  await db.saveState()

  if (process.env.EXIT_ON_POST_BOOTSTRAP) {
    process.exit()
  }
}
