const fs = require(`fs-extra`)
const path = require(`path`)

const checkForHtmlSuffix = pagePath => !/\.(html?)$/i.test(pagePath)

const remove = async ({ publicDir }, pagePath) => {
  const filePath = getPageHtmlFilePath(publicDir, pagePath)

  return fs.remove(filePath)
}

// copied from https://github.com/markdalgleish/static-site-generator-webpack-plugin/blob/master/index.js#L161
const getPageHtmlFilePath = (dir, outputPath) => {
  let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

  if (checkForHtmlSuffix(outputPath)) {
    outputFileName = path.join(outputFileName, `index.html`)
  }

  return path.join(dir, outputFileName)
}

module.exports = {
  remove,
  getPageHtmlFilePath,
}
