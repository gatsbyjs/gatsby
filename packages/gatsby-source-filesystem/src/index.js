const fs = require(`fs-extra`)

function loadNodeContent(fileNode) {
  return fs.readFile(fileNode.absolutePath, `utf-8`)
}

exports.createFilePath = require(`./create-file-path`)
exports.createRemoteFileNodeFactory = require(`./create-remote-file-node-factory`)
exports.createRemoteFileNode = exports.createRemoteFileNodeFactory()

exports.loadNodeContent = loadNodeContent
