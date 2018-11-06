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

module.exports = {
  duplicateNode,
  getConcatenatedValue,
}
