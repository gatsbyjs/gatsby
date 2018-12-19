const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)
const nodePath = require(`path`)

/**
 * copyStaticDir
 * --
 * Copy files from the static directory to the public directory
 */
exports.copyStaticDir = () => {
  const staticDir = nodePath.join(process.cwd(), `static`)
  if (!fs.existsSync(staticDir)) return Promise.resolve()
  return fs.copySync(staticDir, nodePath.join(process.cwd(), `public`))
}

/**
 * syncStaticDir
 * --
 * Set up a watcher to sync changes from the static directory to the public directory
 */
exports.syncStaticDir = () => {
  const staticDir = nodePath.join(process.cwd(), `static`)
  chokidar
    .watch(staticDir)
    .on(`add`, path => {
      const relativePath = nodePath.relative(staticDir, path)
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
    .on(`change`, path => {
      const relativePath = nodePath.relative(staticDir, path)
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
}
