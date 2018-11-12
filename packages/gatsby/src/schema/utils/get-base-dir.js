const findAncestorNode = require(`./find-ancestor-node`)

const getBaseDir = node => {
  if (node) {
    const { dir } =
      findAncestorNode(node, node => node.internal.type === `File`) || {}
    return dir
  }
  return null
}

module.exports = getBaseDir
