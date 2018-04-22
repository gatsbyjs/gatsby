import _ from "lodash"
import path from "path"

export function buildPrefixer(prefix, ...paths) {
  return (...subpaths) => path.join(prefix, ...paths, ...subpaths)
}

// Webpack stats map to an array if source maps are enabled.
// We normalize to make direct map.
function normalizeStats(stats) {
  return _.mapValues(
    stats.assetsByChunkName,
    script => (_.isArray(script) ? script[0] : script)
  )
}

// This function assembles data across the manifests and store to match a similar
// shape of `static-entry.js`. With it, we can build headers that point to the correct
// hashed filenames and ensure we pull in the componentChunkName.
export default function makePluginData(store, assetsManifest, pathPrefix) {
  const { program, pages: storePages } = store.getState()
  const publicFolder = buildPrefixer(program.directory, `public`)
  const stats = require(publicFolder(`webpack.stats.json`))
  const chunkManifest = normalizeStats(stats)
  const pages = storePages

  // We combine the manifest of JS and the manifest of assets to make a lookup table.
  const manifest = { ...assetsManifest, ...chunkManifest }

  return {
    pages,
    manifest,
    pathPrefix,
    publicFolder,
  }
}
