const { resolve } = require(`path`)

const { ensureDir, readdir, copy } = require(`fs-extra`)

function calculateDirs (store) {
  const program = store.getState().program

  const staticDir = resolve(program.directory, `public`, `static`)
  const cacheDir = process.env.NETLIFY_BUILD_BASE
    ? resolve(process.env.NETLIFY_BUILD_BASE, `cache`, `.gatsby-static-files`)
    : resolve(program.directory, `.gatsby-static-files`)

  return {
    staticDir,
    cacheDir,
  }
}

exports.onPreBootstrap = async function({
  store,
}) {
  const { staticDir, cacheDir } = calculateDirs(store)

  console.log(`Ensuring existance of cache and gatsby public/static directory`)
  await ensureDir(cacheDir)
  await ensureDir(staticDir)

  const cacheFiles = await readdir(cacheDir)
  console.log(`Found ${cacheFiles.length} files in cache directory`)

  const staticFiles = await readdir(staticDir)
  console.log(`Found ${staticFiles.length} files in public/static directory`)

  await copy(cacheDir, staticDir, {
    overwrite: false,
  })
  console.log(`Refilled gatsby cache if neccessary`)
}

exports.onPostBuild = async function({
  store,
}) {
  const { staticDir, cacheDir } = calculateDirs(store)

  const cacheFiles = await readdir(cacheDir)
  console.log(`Found ${cacheFiles.length} files in cache directory`)

  const staticFiles = await readdir(staticDir)
  console.log(`Found ${staticFiles.length} files in public/static directory`)

  await copy(staticDir, cacheDir, {
    overwrite: false,
  })
  console.log(`Restored gatsby cache`)
}
