const path = require(`path`)
const fs = require(`fs-extra`)

exports.resolveProcessors = async function() {
  const processorDir = path.join(__dirname, `processors`)
  const pathNames = await fs.readdir(processorDir)
  const dirs = await Promise.all(
    pathNames.map(async name => {
      const stat = await fs.stat(path.join(processorDir, name))
      return { stat, name }
    })
  )
  return dirs
    .filter(dir => dir.stat.isDirectory())
    .map(dir => {
      return {
        path: path.join(processorDir, dir.name),
        name: dir.name,
        key: dir.name.toUpperCase().replace(/-/g, `_`),
      }
    })
}
