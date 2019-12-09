const _ = require(`lodash`)

module.exports = async function getPluginHash({ plugins, existing }) {
  const pluginsHash = plugins.reduce((merged, plugin) => {
    merged[plugin.name] = plugin.version
    return merged
  }, {})

  return {
    changes: _.uniq(
      Object.keys({ ...pluginsHash, ...existing }).filter(name => {
        const hash = pluginsHash[name]
        return hash !== existing[name]
      })
    ),
    hash: pluginsHash,
  }
}
