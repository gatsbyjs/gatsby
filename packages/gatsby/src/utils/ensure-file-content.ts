import { outputFile, readFile } from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"

export async function ensureFileContent(
  file: string,
  data: any
): Promise<boolean> {
  let previousContent: string | undefined = undefined
  try {
    previousContent = await readFile(file, `utf8`)
  } catch (e) {
    // whatever throws, we'll just write the file
  }

  if (previousContent !== data) {
    reporter.verbose(`Updating "${file}"`)
    await outputFile(file, data)
    return true
  }

  reporter.verbose(`Skipping "${file}"`)
  return false
}
