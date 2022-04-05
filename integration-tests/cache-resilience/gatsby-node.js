const fs = require(`fs`)
const v8 = require(`v8`)
const glob = require(`glob`)
const path = require(`path`)
const _ = require(`lodash`)
const { createRequireFromPath } = require(`gatsby-core-utils`)

const { saveState } = require(`gatsby/dist/redux/save-state`)

const {
  ON_PRE_BOOTSTRAP_FILE_PATH,
  ON_POST_BUILD_FILE_PATH,
} = require(`./utils/constants`)
const { getAllPlugins } = require(`./utils/collect-scenarios`)

// use lmdb version used by gatsby core
const gatsbyRequire = createRequireFromPath(require.resolve(`gatsby`))
const { open } = gatsbyRequire(`lmdb`)

const getDiskCacheSnapshot = () => {
  const plugins = getAllPlugins()

  const snapshot = {}
  let store
  try {
    store = open({
      name: `root`,
      path: path.join(process.cwd(), `.cache/caches-lmdb`),
      compression: true,
      maxDbs: 200,
    })
    plugins.forEach(pluginName => {
      const pluginDb = store.openDB({
        name: pluginName,
        encoding: `json`,
      })

      snapshot[pluginName] = Array.from(pluginDb.getKeys({ snapshot: false }))
    })
  } catch (e) {
    console.error(e)
  }

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

    // some normalization so order of fields in type queries is consistent
    if (result) {
      if (result.typeinfoParent && result.typeinfoParent.fields) {
        result.typeinfoParent.fields = result.typeinfoParent.fields.sort(
          (a, b) => {
            return a.name.localeCompare(b.name)
          }
        )
      }

      if (result.typeinfoChild && result.typeinfoChild.fields) {
        result.typeinfoChild.fields = result.typeinfoChild.fields.sort(
          (a, b) => {
            return a.name.localeCompare(b.name)
          }
        )
      }
    }

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
