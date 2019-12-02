const _ = require(`lodash`)

module.exports = async function getPluginHash({ plugins, existing }) {
  const pluginsHash = plugins.reduce((merged, plugin) => {
    merged[plugin.name] = plugin.version
    return merged
  }, {})

  return {
    changes: _.uniq(
      Object.keys(pluginsHash).filter(name => {
        const hash = pluginsHash[name]
        return typeof existing[name] !== `undefined` && hash !== existing[name]
      })
    ),
    hash: pluginsHash,
  }
}
