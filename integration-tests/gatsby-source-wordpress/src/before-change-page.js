module.exports = ({ remoteNode }) => {
  remoteNode.beforeChangeNodeTest = `TEST-${remoteNode.id}`

  return remoteNode
}
