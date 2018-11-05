function notSupported() {
  throw new Error(`Loki not supported yet`)
}

module.exports = {
  getNodes: notSupported(),
  getNode: notSupported(),
  getNodesByType: notSupported(),
  hasNodeChanged: notSupported(),
  loadNodeContent: notSupported(),
  getNodeAndSavePathDependency: notSupported(),
}
