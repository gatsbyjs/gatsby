const path = require(`path`)

module.exports = filePath => {
  const { dir, name } = path.parse(filePath)
  const parsedName = name === `index` ? `` : name

  return path.posix.join(`/`, dir, parsedName, `/`)
}
