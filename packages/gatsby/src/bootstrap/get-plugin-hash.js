const md5File = require(`md5-file/promise`)
const path = require(`path`)
const _ = require(`lodash`)

module.exports = async function getPluginHash({
  additional = [],
  directory,
  plugins,
  existing,
}) {
  const pluginsHash = plugins.reduce((merged, plugin) => {
    merged[plugin.name] = plugin.version
    return merged
  }, {})

  const additionalHash = await Promise.all(
    additional.map(additionalFile =>
      md5File(path.join(directory, additionalFile))
        .catch(() => ``)
        .then(hash => [additionalFile, hash])
    )
  ).then(hashes =>
    hashes.reduce((merged, [fileName, hash]) => {
      merged[fileName] = hash
      return merged
    }, {})
  )

  const hashes = Object.assign({}, pluginsHash, additionalHash)

  return {
    changes: _.uniq(
      Object.keys(hashes).filter(name => {
        const hash = hashes[name]
        return typeof existing[name] !== `undefined` && hash !== existing[name]
      })
    ),
    hash: hashes,
  }
}
