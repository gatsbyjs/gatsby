import report from "gatsby-cli/lib/reporter"
import { sync as existsSync } from "fs-exists-cached"

/**
 * Figure out if the file path is .js or .mjs and return it if it exists.
 */
export function resolveConfigFilePath(filePath: string): string {
  const filePathWithJSExtension = `${filePath}.js`
  const filePathWithMJSExtension = `${filePath}.mjs`

  if (
    existsSync(filePathWithJSExtension) &&
    existsSync(filePathWithMJSExtension)
  ) {
    // TODO: Show project relative path in warning
    report.warn(
      `The file ${filePath} has both .js and .mjs variants, please use one or the other. Using .js by default.`
    )
    return filePathWithJSExtension
  }

  if (existsSync(filePathWithJSExtension)) {
    return filePathWithJSExtension
  }

  if (existsSync(filePathWithMJSExtension)) {
    return filePathWithMJSExtension
  }

  return ``
}
