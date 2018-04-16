const fs = require(`fs-extra`)

exports.createFilePath = require(`./create-file-path`)
exports.createRemoteFileNode = require(`./create-remote-file-node`)
exports.loadNodeContent = file => fs.readFile(file.absolutePath, `utf-8`)
