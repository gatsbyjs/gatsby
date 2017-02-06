const Promise = require(`bluebird`)
const fs = require(`fs`)

async function loadNodeContents (fileNode) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileNode.absolutePath, `utf-8`, (err, fileContents) => {
      if (err) {
        reject(err)
      } else {
        resolve(fileContents)
      }
    })
  })
}

exports.loadNodeContents = loadNodeContents
