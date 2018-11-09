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

function cloneTreeUntil(root, endCondition) {
  let clonedRoot

  function preOrderTraversal(node) {
    if (endCondition(clonedRoot)) {
      return
    }

    const newNode = duplicateNode(node)
    if (clonedRoot) {
      clonedRoot.children.push(newNode)
    } else {
      clonedRoot = newNode
    }

    if (node.children) {
      node.children.forEach(child => {
        clonedRoot = newNode
        preOrderTraversal(child)
      })
    }
  }
  preOrderTraversal(root)
  return clonedRoot
}

module.exports = {
  duplicateNode,
  getConcatenatedValue,
  cloneTreeUntil,
}
