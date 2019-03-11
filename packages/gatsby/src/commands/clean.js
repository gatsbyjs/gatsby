const fs = require(`fs-extra`)
const path = require(`path`)
const { getCachePath, getPublicPath } = require(`../utils/cache`)

module.exports = async function clean(args) {
  const { directory, report } = args

  const directories = [getCachePath(directory), getPublicPath(directory)]

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted directories`)
}
