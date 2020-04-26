import fs from "fs-extra"
import path from "path"

const checkForHtmlSuffix = (pagePath: string): boolean =>
  !/\.(html?)$/i.test(pagePath)

// copied from https://github.com/markdalgleish/static-site-generator-webpack-plugin/blob/master/index.js#L161
export const getPageHtmlFilePath = (
  dir: string,
  outputPath: string
): string => {
  let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

  if (checkForHtmlSuffix(outputPath)) {
    outputFileName = path.join(outputFileName, `index.html`)
  }

  return path.join(dir, outputFileName)
}

export const remove = async (
  { publicDir }: { publicDir: string },
  pagePath: string
): Promise<void> => {
  const filePath = getPageHtmlFilePath(publicDir, pagePath)

  return await fs.remove(filePath)
}
