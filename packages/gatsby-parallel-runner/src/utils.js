const path = require("path")
const { readdir } = require("fs-extra")

exports.resolveProcessors = async function() {
  const processorDir = path.join(__dirname, "processors")
  const pathNames = await readdir(processorDir, {
    withFileTypes: true,
  })
  return pathNames
    .filter(dir => dir.isDirectory())
    .map(dir => ({
      path: path.join(processorDir, dir.name),
      name: dir.name,
      key: dir.name.toUpperCase().replace(/-/g, "_"),
    }))
}
