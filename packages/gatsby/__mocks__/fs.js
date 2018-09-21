'use strict'

const fs = jest.genMockFromModule(`fs`)

let mockFiles = {}
function __setMockFiles(newMockFiles) {
  mockFiles = Object.assign({}, newMockFiles)
}

function readFileSync(filePath, parser) {
  return mockFiles[filePath]
}

fs.__setMockFiles = __setMockFiles
fs.readFileSync = readFileSync

module.exports = fs
