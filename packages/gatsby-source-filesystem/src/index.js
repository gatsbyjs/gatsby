const Promise = require(`bluebird`)
const fs = require(`fs`)

async function loadNodeContent(fileNode) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileNode.absolutePath, `utf-8`, (err, fileContent) => {
      if (err) {
        reject(err)
      } else {
        resolve(fileContent)
      }
    })
  })
}

exports.createFilePath = require(`./create-file-path`)
exports.createRemoteFileNode = require(`./create-remote-file-node`)

exports.loadNodeContent = loadNodeContent
