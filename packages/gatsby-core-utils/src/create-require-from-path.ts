import Module from "node:module"
import { dirname } from "node:path"

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
  mod.paths = (
    Module as typeof Module & IModulePrivateMethods
  )._nodeModulePaths(dirname(filename))
  mod._compile(`module.exports = require;`, filename)

  return mod.exports
}

export const createRequireFromPath = Module.createRequire || fallback
