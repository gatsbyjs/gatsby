import fs from "fs-extra"
import path from "path"

const checkForHtmlSuffix = (pagePath: string): boolean =>
  !/\.(html?)$/i.test(pagePath)

export function generateHtmlPath(dir: string, outputPath: string): string {
  let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

  if (checkForHtmlSuffix(outputPath)) {
    outputFileName = path.join(outputFileName, `index.html`)
  }

  return path.join(dir, outputFileName)
}

export async function remove({ publicDir }, pagePath): Promise<void> {
  const filePath = generateHtmlPath(publicDir, pagePath)

  return fs.remove(filePath)
}
