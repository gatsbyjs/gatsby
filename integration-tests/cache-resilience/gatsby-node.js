const fs = require(`fs`)
const v8 = require(`v8`)
const glob = require(`glob`)
const path = require(`path`)
const _ = require(`lodash`)

const { saveState } = require(`gatsby/dist/redux/save-state`)

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
  const queryResults = {}
  const scenarioPagesDirectory = path.join(
    __dirname,
    `src`,
    `pages`,
    `scenarios`
  )
  const scenarioPagesFiles = glob.sync(
    path.join(scenarioPagesDirectory, `**`, `index.js`)
  )

  scenarioPagesFiles.forEach(scenarioPageFile => {
    const relativePathToPageData = path.dirname(
      path.relative(scenarioPagesDirectory, scenarioPageFile)
    )

    const { dir: scenarioName, name: type } = path.parse(relativePathToPageData)

    const pageDataPath = path.join(
      __dirname,
      `public`,
      `page-data`,
      `scenarios`,
      scenarioName,
      type,
      `page-data.json`
    )

    const result = require(pageDataPath).result.data
    _.set(queryResults, [scenarioName, type], result)
  })

  fs.writeFileSync(
    ON_POST_BUILD_FILE_PATH,
    v8.serialize({
      nodes: getNodes(),
      diskCacheSnapshot: getDiskCacheSnapshot(),
      queryResults,
    })
  )

  await saveState()
}
