const fs = require(`fs`)
const v8 = require(`v8`)
const glob = require(`glob`)
const path = require(`path`)

const db = require(`gatsby/dist/db`)

const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BOOTSTRAP_FILE_PATH,
} = require(`./utils/constants`)

const getDiskCacheSnapshot = () => {
  const plugins = fs.readdirSync(path.join(__dirname, `.cache`, `caches`))

  const snapshot = {}
  plugins.forEach(pluginName => {
    const cacheDir = path.join(__dirname, `.cache`, `caches`, pluginName)
    const files = glob.sync(path.join(cacheDir, `**`), {
      nodir: true,
    })

    snapshot[pluginName] = files.map(absolutePath =>
      path.relative(cacheDir, absolutePath)
    )
  })

  return snapshot
}

exports.onPreBootstrap = ({ getNodes }) => {
  fs.writeFileSync(
    ON_PRE_BOOTSTRAP_FILE_PATH,
    v8.serialize({
      nodes: getNodes(),
      diskCacheSnapshot: getDiskCacheSnapshot(),
    })
  )
}

exports.onPostBootstrap = async ({ getNodes }) => {
  fs.writeFileSync(
    ON_POST_BOOTSTRAP_FILE_PATH,
    v8.serialize({
      nodes: getNodes(),
      diskCacheSnapshot: getDiskCacheSnapshot(),
    })
  )

  await db.saveState()

  if (process.env.EXIT_ON_POST_BOOTSTRAP) {
    process.exit()
  }
}
