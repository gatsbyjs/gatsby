import * as fs from "fs"
import enhancedResolve, { CachedInputFileSystem } from "enhanced-resolve"

export type ModuleResolver = (modulePath: string) => string | false
type ResolveType = (context?: any, path?: any, request?: any) => string | false

// enhanced-resolve 5.16.0 added strict types for CachedInputFileSystem (see
// https://github.com/webpack/enhanced-resolve/pull/408). The BaseFileSystem type
// is narrower than Node's fs - it omits overloads like readdir's withFileTypes.
// Extract the expected type and cast to it.
type InputFileSystem = ConstructorParameters<typeof CachedInputFileSystem>[0]

export const resolveModule: ModuleResolver = modulePath => {
  let resolve: ResolveType

  try {
    resolve = enhancedResolve.create.sync({
      fileSystem: new CachedInputFileSystem(
        fs as unknown as InputFileSystem,
        5000
      ),
      extensions: [`.ts`, `.tsx`, `.js`, `.jsx`],
    })
  } catch (err) {
    // ignore
  }

  // @ts-ignore - See https://github.com/microsoft/TypeScript/issues/9568
  return resolve({}, modulePath, modulePath)
}
