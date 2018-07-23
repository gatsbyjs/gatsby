const visit = require(`unist-util-visit`)
const remove = require(`unist-util-remove`)

module.exports = ({ markdownAST }) => {
  const visitor = function(node, index, parent) {
    let nodesToCollect = []

    const adjacent = parent && parent.children

    if (!adjacent) {
      return false // stop traversing
    }

    // add this node
    const copyOfThisNode = Object.assign({}, node)

    nodesToCollect.push(copyOfThisNode)

    // try our best to maintain this position information
    const start = node.position.start
    let end = node.position.end

    for (let [adjacentIndex, adjacentNode] of adjacent.entries()) {
      // ignore nodes before this one
      if (adjacentIndex <= index) {
        continue
      }

      // if it's a heading on the same level or higher than us, break
      if (adjacentNode.type === `heading` && adjacentNode.depth <= node.depth) {
        break
      }

      // copy and add the node
      const copy = Object.assign({}, adjacentNode)
      nodesToCollect.push(copy)
      end = copy.position.end

      // mark the old node for deletion
      adjacentNode.type = `to-delete`
    }

    // delete the nodes
    remove(markdownAST, `to-delete`)

    // replace our node.
    node.type = `element`
    node.position.start = start
    node.position.end = end
    node.data = {
      hName: `section`,
    }
    node.properties = {}
    node.children = nodesToCollect
    delete node.depth

    // we don't want to recursively search, just top level, so 'skip' this node
    // as we've already done the work we need to
    return `skip`
  }

  // recursively search for heading nodes
  visit(markdownAST, `heading`, visitor)

  return markdownAST
}
