import fs from "fs-extra"
import chokidar from "chokidar"
import nodePath from "path"
import { store } from "../redux"

/**
 * copyStaticDirs
 * --
 * Copy files from the static directory to the public directory
 */
export const copyStaticDirs = (): void => {
  // access the store to get themes
  const { themes, flattenedPlugins } = store.getState()
  // if there are legacy themes, only use them. Otherwise proceed with plugins
  const themesSet = themes.themes
    ? themes.themes
    : flattenedPlugins.map(plugin => {
        return {
          themeDir: plugin.pluginFilepath,
          themeName: plugin.name,
        }
      })

  themesSet
    // create an array of potential theme static folders
    .map(theme => nodePath.resolve(theme.themeDir, `static`))
    // filter out the static folders that don't exist
    .filter(themeStaticPath => fs.existsSync(themeStaticPath))
    // copy the files for each folder into the user's build
    .map(folder => fs.copySync(folder, nodePath.join(process.cwd(), `public`)))

  const staticDir = nodePath.join(process.cwd(), `static`)
  if (!fs.existsSync(staticDir)) return undefined
  return fs.copySync(staticDir, nodePath.join(process.cwd(), `public`), {
    dereference: true,
  })
}

/**
 * syncStaticDir
 * --
 * Set up a watcher to sync changes from the static directory to the public directory
 */
export const syncStaticDir = (): void => {
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
