import path from "path"
import fs from "fs-extra"

export function buildPrefixer(prefix, ...paths) {
  return (...subpaths) => path.join(prefix, ...paths, ...subpaths)
}

// This function assembles data across the manifests and store to match a similar
// shape of `static-entry.js`. With it, we can build headers that point to the correct
// hashed filenames and ensure we pull in the componentChunkName.
export default function makePluginData(store, assetsManifest) {
  const { program, pages, components, config } = store.getState()
  const publicFolder = buildPrefixer(program.directory, `public`)
  const functionsFolder = buildPrefixer(
    program.directory,
    `.cache`,
    `functions`
  )
  const stats = fs.readJSONSync(publicFolder(`webpack.stats.json`))
  // Get all the files, not just the first
  const chunkManifest = stats.assetsByChunkName

  // We combine the manifest of JS and the manifest of assets to make a lookup table.
  const manifest = { ...assetsManifest, ...chunkManifest }

  return {
    pages,
    components,
    manifest,
    program,
    pathPrefix: config.pathPrefix,
    assetPrefix: config.assetPrefix,
    publicFolder,
    functionsFolder,
  }
}
