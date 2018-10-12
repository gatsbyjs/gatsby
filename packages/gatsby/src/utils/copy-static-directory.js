const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)
const nodePath = require(`path`)
const { store } = require(`../redux`)

module.exports = () => {
  chokidar
    .watch(`${process.cwd()}/static`)
    .on(`add`, path => {
      const relativePath = nodePath.relative(
        nodePath.join(`${process.cwd()}`, store.getState().config.assetPath, `static`),
        path
      )
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
    .on(`change`, path => {
      const relativePath = nodePath.relative(
        nodePath.join(`${process.cwd()}`, store.getState().config.assetPath, `static`),
        path
      )
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
}
