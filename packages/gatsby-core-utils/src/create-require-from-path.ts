import Module from "module"
import path from "path"

const fallback = (filename: string): NodeRequire => {
  // @ts-ignore
  const mod = new Module(filename, null)

  mod.filename = filename
  // @ts-ignore
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  mod._compile(`module.exports = require;`, filename)

  return mod.exports
}

// Polyfill Node's `Module.createRequireFromPath` if not present (added in Node v10.12.0)
export const createRequireFromPath =
  Module.createRequire || Module.createRequireFromPath || fallback
