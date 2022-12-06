import path from "path"
import report from "gatsby-cli/lib/reporter"

/**
 * Figure out if the file path is .js or .mjs without relying on the fs module, and return the file path if it exists.
 */
export async function resolveJSFilepath(
  siteDirectory: string,
  filePath: string
): Promise<string> {
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
      report.warn(
        `The file '${path.relative(
          siteDirectory,
          filePath
        )}' has both .js and .mjs variants, please use one or the other. Using .js by default.`
      )
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
