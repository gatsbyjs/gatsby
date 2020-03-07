import Module from "module"
import path from "path"

// Polyfill Node's `Module.createRequireFromPath` if not present (added in Node v10.12.0)
const createRequire = (filename: string): NodeRequire => {
  if (`createRequire` in Module) {
    return Module.createRequire(filename)
  }
  if (`createRequireFromPath` in Module) {
    return Module.createRequireFromPath(filename)
  }

  const mod = new Module(filename, null)

  mod.filename = filename
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  mod._compile(`module.exports = require;`, filename)

  return mod.exports
}

export default createRequire
