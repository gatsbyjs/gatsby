const Promise = require(`bluebird`)
const chokidar = require(`chokidar`)
const slash = require(`slash`)

module.exports = async (path, glob, onNewFile, onRemovedFile) =>
  new Promise((resolve, reject) => {
    chokidar
      .watch(glob, {
        cwd: path,
        // Setting useFsEvents to false fixes https://github.com/gatsbyjs/gatsby/issues/17131
        useFsEvents: process.env.GATSBY_USE_FSEVENTS !== `0`,
      })
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
