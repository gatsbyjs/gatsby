const Promise = require(`bluebird`)
const glob = require(`glob`)
const _ = require(`lodash`)
const { siteDB, programDB } = require(`../utils/globals`)

const runAPI = (plugin, api, args) => {
  let linkPrefix = ``
  if (programDB().prefixLinks) {
    linkPrefix = siteDB().get(`config`).linkPrefix
  }

  const gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
  if (gatsbyNode[api]) {
    console.log(`calling api handler in ${plugin.resolve} for api ${api}`)
    const result = gatsbyNode[api]({
      args: { ...args, linkPrefix },
      pluginOptions: plugin.pluginOptions,
    })
    if (!result) {
      throw new Error(`The API "${api}" in gatsby-node.js of the plugin at ${plugin.resolve} did not return a value`)
    }
    return Promise.resolve(result)
  }

  return null
}

let filteredPlugins
const hasAPIFile = (plugin) => (
  glob.sync(`${plugin.resolve}/gatsby-node*`)[0]
)

module.exports = async (api, args={}) => {
  const plugins = siteDB().get(`flattenedPlugins`)
  // Get the list of plugins that implement gatsby-node
  if (!filteredPlugins) {
    filteredPlugins = plugins.filter((plugin) => hasAPIFile(plugin))
  }

  const resultPromises = filteredPlugins.map((plugin) => runAPI(plugin, api, args))

  // Return promises with empty results filtered out.
  return Promise.all(resultPromises)
  .then((results) => results.filter((result) => !_.isEmpty(result)))
}
