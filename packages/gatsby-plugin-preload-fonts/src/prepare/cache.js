module.exports.load = load
module.exports.save = save

// TODO: implement stub

let cache

function load() {
  cache = {}
  return Promise.resolve(cache)
}

function save(data) {
  cache = data
  return Promise.resolve()
}
