import { resolveConfigFilePath } from "./resolve-config-file-path"

/**
 * Given a module path, return an array of the module's exports.
 *
 * Returns [] for invalid paths and modules without exports.
 *
 * @param modulePath
 */
export async function resolveModuleExports(
  rootDir: string,
  modulePath: string
): Promise<Array<string>> {
  try {
    const moduleFilepath = resolveConfigFilePath(rootDir, modulePath)

    if (!moduleFilepath) {
      return []
    }

    const importedModule = await import(moduleFilepath)

    const importedModuleExports = Object.keys(importedModule).filter(
      exportName => exportName !== `__esModule` && exportName !== `default`
    )

    return importedModuleExports
  } catch (error) {
    return []
  }
}
