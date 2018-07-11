"use strict"

const fs = jest.genMockFromModule(`fs-extra`)

let mockFiles = {}
function __setMockFiles(newMockFiles) {
  mockFiles = Object.assign({}, newMockFiles)
}

function readFileSync(filePath, parser) {
  return mockFiles[filePath]
}

function readFile(filePath, parser) {
  return new Promise(resolve  => resolve(mockFiles[filePath]))
}

fs.__setMockFiles = __setMockFiles
fs.readFileSync = readFileSync
fs.readFile = readFile

module.exports = fs
