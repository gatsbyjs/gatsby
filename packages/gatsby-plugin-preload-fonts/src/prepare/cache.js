const fs = require(`fs`)
const path = require(`path`)

const findCacheDir = require(`find-cache-dir`)

const { ensureDir } = require(`./utils`)

module.exports.getPath = getPath
module.exports.load = load
module.exports.save = save

function getPath() {
  return path.join(cacheDir, `cache.json`)
}

let cache
const cacheDir = findCacheDir({ name: `gatsby-plugin-preload-fonts` })
try {
  ensureDir(cacheDir)
} catch (e) {
  console.log(
    `could not write to cache directory, please make sure the following path exists and is writable`
  )
  console.log(`  ${cacheDir}`)
  console.error(e)
  process.exit(1)
}

function load() {
  if (cache) return cache

  try {
    const json = fs.readFileSync(getPath(), `utf-8`)
    cache = JSON.parse(json)
    return cache
  } catch (err) {
    return {
      timestamp: Date.now(),
      hash: `initial-run`,
      assets: {},
    }
  }
}

function save(data) {
  const json = JSON.stringify(data)
  fs.writeFileSync(getPath(), json, `utf-8`)
  cache = data
}
