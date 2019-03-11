const fs = require(`fs-extra`)
const path = require(`path`)
const { getCachePath } = require(`../utils/cache`)

module.exports = async function clean(args) {
  const { directory, report } = args

  const directories = [getCachePath(directory), `public`]

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted directories`)
}
