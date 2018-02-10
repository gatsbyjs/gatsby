const systemPath = require(`path`)

const tsDeclarationExtTest = /\.d\.tsx?$/

function isTestFile(path) {
  const testFileTest = new RegExp(`(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$`)
  return path.match(testFileTest)
}

module.exports = path => {
  // Disallow paths starting with an underscore
  // and template-.
  // and .d.ts
  const parsedPath = systemPath.parse(path)
  return (
    parsedPath.name.slice(0, 1) !== `_` &&
    parsedPath.name.slice(0, 9) !== `template-` &&
    !tsDeclarationExtTest.test(parsedPath.base) &&
    !isTestFile(parsedPath.base)
  )
}
