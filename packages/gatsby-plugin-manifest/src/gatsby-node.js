const fs = require(`fs`)
const _ = require(`lodash`)

const mapKeysDeep = (obj, cb) =>
  _.mapValues(
    _.mapKeys(obj, cb),
    val => (_.isObject(val) ? mapKeysDeep(val, cb) : val),
  )

exports.postBuild = (args, pluginOptions) =>
  new Promise(resolve => {
    let manifest = _.omit(pluginOptions, [`plugins`])
    manifest = mapKeysDeep(manifest, (v, k) => _.snakeCase(k))
    fs.writeFileSync(`./public/manifest.json`, JSON.stringify(manifest))
    resolve()
  })
