const fs = require(`fs-extra`)
const nodePath = require(`path`)

module.exports = () => {
  const path = `${process.cwd()}/static`
  const relativePath = nodePath.relative(`${process.cwd()}/static`, path)
  fs.copy(path, `${process.cwd()}/public/${relativePath}`)
}
