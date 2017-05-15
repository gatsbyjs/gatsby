const Promise = require(`bluebird`)
const glob = require(`glob`)
const _ = require(`lodash`)
const mapSeries = require(`async/mapSeries`)

const cache = require(`./cache`)

// Bind action creators per plugin so can auto-add plugin
// meta-data to data they create.
const boundPluginActionCreators = {}
const doubleBind = (boundActionCreators, plugin) => {
  if (boundPluginActionCreators[plugin.name]) {
    return boundPluginActionCreators[plugin.name]
  } else {
    const keys = Object.keys(boundActionCreators)
    const doubleBoundActionCreators = {}
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const boundActionCreator = boundActionCreators[key]
      if (typeof boundActionCreator === `function`) {
        doubleBoundActionCreators[key] = (...args) => {
          // Automatically add to newly created nodes
          // the plugin's name
          if (key === `createNode`) {
            args[0].internal.pluginName = plugin.name
          }
          return boundActionCreator(...args, plugin)
        }
      }
    }
    boundPluginActionCreators[plugin.name] = doubleBoundActionCreators
    return doubleBoundActionCreators
  }
}

const runAPI = (plugin, api, args) => {
  let linkPrefix = ``
  const {
    store,
    loadNodeContent,
    getNodes,
    getNode,
    hasNodeChanged,
    getNodeAndSavePathDependency,
  } = require(`../redux`)
  const { boundActionCreators } = require(`../redux/actions`)

  // Wrap "createNode" so we can autoset the package name
  // of the plugin that creates each node.
  const doubleBoundActionCreators = doubleBind(boundActionCreators, plugin)

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
        boundActionCreators: doubleBoundActionCreators,
        loadNodeContent,
        store,
        getNodes,
        getNode,
        hasNodeChanged,
        getNodeAndSavePathDependency,
        cache,
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
    const { store } = require(`../redux`)
    const plugins = store.getState().flattenedPlugins
    // Get the list of plugins that implement gatsby-node
    if (!filteredPlugins) {
      filteredPlugins = plugins.filter(plugin => hasAPIFile(plugin))
    }
    mapSeries(
      filteredPlugins,
      (plugin, callback) => {
        Promise.resolve(runAPI(plugin, api, args)).asCallback(callback)
      },
      (err, results) => {
        if (err) {
          console.log(``)
          console.log(`A plugin returned an error`)
          console.log(``)
          console.log(err)
          process.exit(1)
        }
        // Filter out empty responses and return
        resolve(results.filter(result => !_.isEmpty(result)))
      }
    )
  })
}
