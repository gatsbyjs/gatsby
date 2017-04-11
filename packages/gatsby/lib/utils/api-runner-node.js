const Promise = require("bluebird")
const glob = require("glob")
const _ = require("lodash")
const mapSeries = require("async/mapSeries")

const runAPI = (plugin, api, args) => {
  let linkPrefix = ``
  const {
    store,
    getNodes,
    getNode,
    getNodeAndSavePathDependency,
  } = require("../redux")
  const { boundActionCreators } = require("../redux/actions")
  if (store.getState().program.prefixLinks) {
    linkPrefix = store.getState().config.linkPrefix
  }

  const gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
  if (gatsbyNode[api]) {
    if (!_.includes([`onNodeCreate`], api)) {
      console.log(`calling api handler in ${plugin.resolve} for api ${api}`)
    }
    const result = gatsbyNode[api](
      {
        ...args,
        linkPrefix,
        actionCreators: boundActionCreators,
        store,
        getNodes,
        getNode,
        getNodeAndSavePathDependency,
      },
      plugin.pluginOptions
    )

    return Promise.resolve(result)
  }

  return null
}

let filteredPlugins
const hasAPIFile = plugin => glob.sync(`${plugin.resolve}/gatsby-node*`)[0]

module.exports = async (api, args = {}) => {
  return new Promise(resolve => {
    const { store } = require("../redux")
    const plugins = store.getState().flattenedPlugins
    // Get the list of plugins that implement gatsby-node
    if (!filteredPlugins) {
      filteredPlugins = plugins.filter(plugin => hasAPIFile(plugin))
    }

    mapSeries(
      filteredPlugins,
      (plugin, callback) => {
        Promise.resolve(runAPI(plugin, api, args)).then(result => {
          callback(null, result)
        })
      },
      (err, results) => {
        // Filter out empty responses and return
        resolve(results.filter(result => !_.isEmpty(result)))
      }
    )
  })
}
