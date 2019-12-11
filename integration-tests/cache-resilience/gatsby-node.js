const fs = require(`fs`)
const v8 = require(`v8`)
const glob = require(`glob`)
const path = require(`path`)
const _ = require(`lodash`)

const db = require(`gatsby/dist/db`)

const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BUILD_FILE_PATH,
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

exports.onPostBuild = async ({ getNodes, store }) => {
  const pluginNames = store
    .getState()
    .config.plugins.map(plugin => plugin.resolve)

  const queryResults = pluginNames.reduce((acc, pluginName) => {
    const pageDataPath = path.join(
      `public`,
      `page-data`,
      pluginName,
      `page-data.json`
    )
    if (fs.existsSync(pageDataPath)) {
      const { result } = require(`./${pageDataPath}`)

      acc[pluginName] = _.omit(result, [`pageContext`])
    }

    return acc
  }, {})

  fs.writeFileSync(
    ON_POST_BUILD_FILE_PATH,
    v8.serialize({
      nodes: getNodes(),
      diskCacheSnapshot: getDiskCacheSnapshot(),
      queryResults,
    })
  )

  await db.saveState()
}
