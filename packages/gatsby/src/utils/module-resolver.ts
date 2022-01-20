import fs from "fs"
import enhancedResolve, { CachedInputFileSystem } from "enhanced-resolve"

type ModuleResolver = (contextDir: string, modulePath: string) => false | string

export const resolveModule: ModuleResolver = enhancedResolve.create.sync({
  fileSystem: new CachedInputFileSystem(fs, 5000),
  extensions: [`.ts`, `.tsx`, `.js`, `.jsx`],
})
