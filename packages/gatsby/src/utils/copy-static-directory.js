const fs = require("fs-extra")
const chokidar = require("chokidar")
const { store } = require(`../redux`)
const nodePath = require("path")

module.exports = () => {
  const rootDir = store.getState()

  chokidar
    .watch(`${process.cwd()}/static`)
    .on(`add`, path => {
      const relativePath = nodePath.relative(process.cwd(), path)
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
    .on(`change`, path => {
      const relativePath = nodePath.relative(process.cwd(), path)
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
}
