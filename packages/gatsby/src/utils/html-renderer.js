const Queue = require(`better-queue`)
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

module.exports = (htmlComponentRenderer, pages) =>
  new Promise((resolve, reject) => {
    const queue = new Queue(
      (path, callback) => {
        try {
          htmlComponentRenderer.default(path, (throwAway, htmlString) => {
            fs.outputFile(generatePathToOutput(path), htmlString).then(() => {
              callback()
            })
          })
        } catch (e) {
          reject(e)
        }
      },
      {
        concurrent: 20,
      }
    )

    pages.forEach(page => {
      queue.push(page)
    })

    queue.on(`drain`, () => {
      resolve()
    })
  })
