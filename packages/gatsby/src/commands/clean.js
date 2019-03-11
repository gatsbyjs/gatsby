const fs = require(`fs-extra`)
const path = require(`path`)
const { cachePath, publicPath } = require(`../utils/cache`)

module.exports = async function clean(args) {
  const { directory, report } = args

  const directories = [cachePath(``, directory), publicPath(``, directory)]

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted directories`)
}
