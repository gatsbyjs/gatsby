"use strict";

var fs = require(`fs-extra`);

function loadNodeContent(fileNode) {
  return fs.readFile(fileNode.absolutePath, `utf-8`);
}

exports.createFilePath = require(`./create-file-path`);
exports.createRemoteFileNode = require(`./create-remote-file-node`);

exports.loadNodeContent = loadNodeContent;