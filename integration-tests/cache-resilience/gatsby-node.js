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
const { getAllPlugins } = require(`./utils/collect-scenarios`)

const getDiskCacheSnapshot = () => {
  const plugins = getAllPlugins()

  const snapshot = {}
  plugins.forEach(pluginName => {
    const cacheDirectory = path.join(__dirname, `.cache`, `caches`, pluginName)

    const files = glob.sync(path.join(cacheDirectory, `**`), {
      nodir: true,
    })

    snapshot[pluginName] = files.map(absolutePath =>
      path.relative(cacheDirectory, absolutePath)
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
  const plugins = store.getState().config.plugins || []

  const pluginNames = plugins.map(plugin => plugin.resolve)

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
