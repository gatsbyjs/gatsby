import * as fs from "fs"
import enhancedResolve, { CachedInputFileSystem } from "enhanced-resolve"

type ModuleResolver = (
  contextDir: any,
  modulePath: string,
  request: string
) => string

export const resolveModule: ModuleResolver = (...args) => {
  let resolve

  try {
    resolve = enhancedResolve.create.sync({
      fileSystem: new CachedInputFileSystem(fs, 5000),
      extensions: [`.ts`, `.tsx`, `.js`, `.jsx`],
    })
  } catch (err) {
    // ignore
  }

  return resolve(...args)
}
