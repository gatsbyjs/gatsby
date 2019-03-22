const fs = require(`fs-extra`)

// test test test ignore pls

function loadNodeContent(fileNode) {
  return fs.readFile(fileNode.absolutePath, `utf-8`)
}

exports.createFilePath = require(`./create-file-path`)
exports.createRemoteFileNode = require(`./create-remote-file-node`)

exports.loadNodeContent = loadNodeContent
