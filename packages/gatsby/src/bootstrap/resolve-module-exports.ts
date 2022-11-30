import { resolveConfigFilePath } from "./resolve-config-file-path"
import { testImportError } from "../utils/test-import-error"
import report from "gatsby-cli/lib/reporter"

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
      exportName => exportName !== `__esModule`
    )

    return importedModuleExports
  } catch (error) {
    if (!testImportError(modulePath, error)) {
      // TODO: Structured error
      report.panic(
        `We encountered an error while trying to resolve exports from "${modulePath}". Please fix the error and try again.`
      )
    } else {
      // Do nothing
    }
  }

  return []
}
