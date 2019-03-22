const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)
const nodePath = require(`path`)
const { store } = require(`.../redux`)

/**
 * copyStaticDirs
 * --
 * Copy files from the static directory to the public directory
 */
exports.copyStaticDirs = () => {
  // access the store to get themes
  const state = store.getState()
  // create an array of existing theme static folders
  const themeStaticFolders = state.themes.themes.reduce((hasStatic, theme) => {
    const staticPath = nodePath.resolve(theme.resolve, `static`)
    if (fs.existsSync(staticPath)) {
      hasStatic.push(staticPath)
    }
    return hasStatic
  }, [])
  // copy existing static folders into the public directory
  if (themeStaticFolders.length) {
    themeStaticFolders.map(folder =>
      fs.copySync(folder, nodePath.join(process.cwd(), `public`))
    )
  }
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
