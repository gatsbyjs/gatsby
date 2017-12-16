const systemPath = require(`path`)

const tsDeclarationExtTest = /\.d\.tsx?$/

module.exports = path => {
  // Disallow paths starting with an underscore
  // and template-.
  // and .d.ts
  const parsedPath = systemPath.parse(path)
  return (
    parsedPath.name.slice(0, 1) !== `_` &&
    parsedPath.name.slice(0, 9) !== `template-` &&
    !tsDeclarationExtTest.test(parsedPath.base)
  )
}
