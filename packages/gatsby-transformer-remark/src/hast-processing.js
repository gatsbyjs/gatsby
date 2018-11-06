function duplicateNode(node) {
  return {
    type: node.type,
    children: [],
    tagName: node.tagName,
    value: node.value,
  }
}

function getConcatenatedValue(node) {
  if (!node) {
    return ``
  }
  if (node.type === `text`) {
    return node.value
  } else if (node.children && node.children.length) {
    return node.children
      .map(getConcatenatedValue)
      .filter(value => value)
      .join(``)
  }
  return ``
}

function preOrderTraversal(node, parent, processingFunction) {
  processingFunction(node, parent)
  if (node.children) {
    node.children.forEach(child => {
      preOrderTraversal(child, node, processingFunction)
    })
  }
}

module.exports = {
  duplicateNode,
  getConcatenatedValue,
  preOrderTraversal,
}
