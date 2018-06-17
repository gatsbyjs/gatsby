const Module = require(`module`)
const loaderUtils = require(`loader-utils`)
const path = require(`path`)

module.exports = function(content) {
  const [filename] = loaderUtils
    .getRemainingRequest(this)
    .split(`!`)
    .slice(-1)

  const dir = path.dirname(filename)

  var m = new Module(filename, this)
  m.filename = filename
  m.paths = Module._nodeModulePaths(dir)
  m._compile(content, filename)

  return `module.exports = ${JSON.stringify(m.exports.locals)}`
}
