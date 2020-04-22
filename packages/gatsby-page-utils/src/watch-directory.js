const Promise = require(`bluebird`)
const chokidar = require(`chokidar`)
const { slash } = require(`gatsby-core-utils`)

module.exports = async (path, glob, onNewFile, onRemovedFile) =>
  new Promise((resolve, reject) => {
    chokidar
      .watch(glob, { cwd: path })
      .on(`add`, path => {
        path = slash(path)
        onNewFile(path)
      })
      .on(`unlink`, path => {
        path = slash(path)
        onRemovedFile(path)
      })
      .on(`ready`, () => resolve())
  })
