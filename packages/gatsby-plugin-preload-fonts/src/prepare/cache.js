const fs = require(`fs-extra`)
const path = require(`path`)

function createEmptyCache() {
  return {
    timestamp: Date.now(),
    hash: `initial-run`,
    assets: {},
  }
}

const cacheDir = process.cwd()
const cacheFile = path.join(cacheDir, `font-preload-cache.json`)

let cache

function load() {
  if (cache) return cache

  try {
    const json = fs.readFileSync(cacheFile, `utf-8`)
    cache = JSON.parse(json)
    return cache
  } catch (err) {
    return createEmptyCache()
  }
}

function save(data) {
  try {
    const json = JSON.stringify(data)
    fs.writeFileSync(cacheFile, json, `utf-8`)
    cache = data
  } catch (e) {
    console.log(
      `could not write to cache directory, please make sure the following path exists and is writable`
    )
    console.log(`  ${cacheDir}`)
    console.error(e)
    process.exit(1)
  }
}

module.exports.load = load
module.exports.save = save
module.exports.cacheFile = cacheFile
