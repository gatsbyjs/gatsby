import Module from "module"
import path from "path"

/**
 * We need to use private Module methods in this polyfill
 */
interface IModulePrivateMethods {
  _nodeModulePaths: (directory: string) => Array<string>
  _compile: (src: string, file: string) => void
}

const fallback = (filename: string): NodeRequire => {
  const mod = new Module(filename) as Module & IModulePrivateMethods

  mod.filename = filename
  mod.paths = (Module as typeof Module &
    IModulePrivateMethods)._nodeModulePaths(path.dirname(filename))
  mod._compile(`module.exports = require;`, filename)

  return mod.exports
}

// Polyfill Node's `Module.createRequireFromPath` if not present (added in Node v10.12.0)
export const createRequireFromPath =
  Module.createRequire || Module.createRequireFromPath || fallback
