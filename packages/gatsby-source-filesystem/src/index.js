const fs = require(`fs-extra`)
const iconvlite = require(`iconv-lite`)

async function loadNodeContent(fileNode, encoding) {
  const content = await fs.readFile(fileNode.absolutePath)
  return iconvlite.decode(content, encoding || `utf8`)
}

exports.createFilePath = require(`./create-file-path`)
exports.createRemoteFileNode = require(`./create-remote-file-node`)
exports.createFileNodeFromBuffer = require(`./create-file-node-from-buffer`)

exports.loadNodeContent = loadNodeContent
