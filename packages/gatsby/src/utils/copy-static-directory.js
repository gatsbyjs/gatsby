const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)
const nodePath = require(`path`)

module.exports = () => {
  const buildDirectory = process.env.GATSBY_BUILD_DIR || `public`
  chokidar
    .watch(`${process.cwd()}/static`)
    .on(`add`, path => {
      const relativePath = nodePath.relative(`${process.cwd()}/static`, path)
      fs.copy(path, `${process.cwd()}/${buildDirectory}/${relativePath}`)
    })
    .on(`change`, path => {
      const relativePath = nodePath.relative(`${process.cwd()}/static`, path)
      fs.copy(path, `${process.cwd()}/${buildDirectory}/${relativePath}`)
    })
}
