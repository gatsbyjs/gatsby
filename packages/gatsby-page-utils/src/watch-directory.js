const Promise = require(`bluebird`)
const chokidar = require(`chokidar`)
const slash = require(`slash`)

module.exports = async (path, glob, onNewFile, onRemovedFile) =>
  new Promise((resolve, reject) => {
    chokidar
      // Setting useFsEvents to false fixes https://github.com/gatsbyjs/gatsby/issues/17131
      .watch(glob, { cwd: path, useFsEvents: false })
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
