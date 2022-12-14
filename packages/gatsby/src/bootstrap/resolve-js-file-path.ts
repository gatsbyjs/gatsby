import path from "path"
import { pathToFileURL } from "url"
import report from "gatsby-cli/lib/reporter"

/**
 * On Windows, the file protocol is required for the path to be resolved correctly.
 * On other platforms, the file protocol is not required, but supported, so we want to just always use it.
 * Except jest doesn't work with that and in that environment we never add the file protocol.
 */
export const maybeAddFileProtocol = process.env.JEST_WORKER_ID
  ? (module: string): string => module
  : (module: string): string => pathToFileURL(module).href

/**
 * Figure out if the file path is .js or .mjs without relying on the fs module, and return the file path if it exists.
 */
export async function resolveJSFilepath({
  rootDir,
  filePath,
  warn = true,
}: {
  rootDir: string
  filePath: string
  warn?: boolean
}): Promise<string> {
  const filePathWithJSExtension = filePath.endsWith(`.js`)
    ? filePath
    : `${filePath}.js`
  const filePathWithMJSExtension = filePath.endsWith(`.mjs`)
    ? filePath
    : `${filePath}.mjs`

  // Check if both variants exist
  try {
    if (
      require.resolve(filePathWithJSExtension) &&
      require.resolve(filePathWithMJSExtension)
    ) {
      if (warn) {
        report.warn(
          `The file '${path.relative(
            rootDir,
            filePath
          )}' has both .js and .mjs variants, please use one or the other. Using .js by default.`
        )
      }
      return filePathWithJSExtension
    }
  } catch (_) {
    // Do nothing
  }

  // Check if .js variant exists
  try {
    if (require.resolve(filePathWithJSExtension)) {
      return filePathWithJSExtension
    }
  } catch (_) {
    // Do nothing
  }

  try {
    if (require.resolve(filePathWithMJSExtension)) {
      return filePathWithMJSExtension
    }
  } catch (_) {
    // Do nothing
  }

  return ``
}
