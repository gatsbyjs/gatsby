import fs from "fs-extra"
import path from "path"

const checkForHtmlSuffix = (pagePath: string): boolean =>
  !/\.(html?)$/i.test(pagePath)

export async function remove({ publicDir }, pagePath): Promise<void> {
  const filePath = getPageHtmlFilePath(publicDir, pagePath)

  return fs.remove(filePath)
}

export function getPageHtmlFilePath(dir: string, outputPath: string): string {
  let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

  if (checkForHtmlSuffix(outputPath)) {
    outputFileName = path.join(outputFileName, `index.html`)
  }

  return path.join(dir, outputFileName)
}
