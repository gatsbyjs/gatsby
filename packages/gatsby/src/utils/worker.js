const fs = require(`fs-extra`)
const path = require(`path`)

// copied from https://github.com/markdalgleish/static-site-generator-webpack-plugin/blob/master/index.js#L161
const generatePathToOutput = outputPath => {
  let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

  if (!/\.(html?)$/i.test(outputFileName)) {
    outputFileName = path.join(outputFileName, `index.html`)
  }

  return path.join(process.cwd(), `public`, outputFileName)
}

export function renderHTML({ htmlComponentRendererPath, path }) {
  return new Promise((resolve, reject) => {
    const htmlComponentRenderer = require(htmlComponentRendererPath)
    try {
      htmlComponentRenderer.default(path, (throwAway, htmlString) => {
        resolve(fs.outputFile(generatePathToOutput(path), htmlString))
      })
    } catch (e) {
      reject(e)
    }
  })
}
