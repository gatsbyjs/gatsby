import { outputFile, readFile } from "fs-extra"

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
    await outputFile(file, data)
    return true
  }

  return false
}
