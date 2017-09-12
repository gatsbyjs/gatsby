const systemPath = require(`path`)

module.exports = path => {
  // Disallow paths starting with an underscore
  // and template-.
  const parsedPath = systemPath.parse(path)
  return (
    parsedPath.name.slice(0, 1) !== `_` &&
    parsedPath.name.slice(0, 9) !== `template-`
  )
}
