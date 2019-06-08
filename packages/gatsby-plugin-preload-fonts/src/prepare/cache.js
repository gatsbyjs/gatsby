const path = require(`path`)

module.exports.getPath = getPath
module.exports.load = load
module.exports.save = save

let cache

function getPath() {
  return path.join(__dirname, `cache.json`)
}

function load() {
  cache = {
    timestamp: Date.now(),
    hash: `not_a_real_hash`,
    assets: {},
  }
  return Promise.resolve(cache)
}

function save(data) {
  cache = data
  return Promise.resolve()
}
