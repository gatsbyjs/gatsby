const generate = require(`@babel/generator`).default
const t = require(`@babel/types`)

const getKeyNameFromAttribute = node => node.key.name || node.key.value

const unwrapTemplateLiteral = str =>
  str.trim().replace(/^`/, ``).replace(/`$/, ``)

const isLiteral = node =>
  t.isLiteral(node) || t.isStringLiteral(node) || t.isNumericLiteral(node)

const getValueFromNode = node => {
  if (t.isTemplateLiteral(node)) {
    delete node.leadingComments
    const literalContents = generate(node).code
    return unwrapTemplateLiteral(literalContents)
  }

  if (isLiteral(node)) {
    return node.value
  }

  if (node.type === `ArrayExpression`) {
    return node.elements.map(getObjectFromNode)
  }

  if (node.type === `ObjectExpression`) {
    return getObjectFromNode(node)
  }

  return null
}

const getObjectFromNode = nodeValue => {
  if (!nodeValue || !nodeValue.properties) {
    return getValueFromNode(nodeValue)
  }

  const props = nodeValue.properties.reduce((acc, curr) => {
    let value = null

    if (curr.value) {
      value = getValueFromNode(curr.value)
    } else if (t.isObjectExpression(curr.value)) {
      value = curr.value.expression.properties.reduce((acc, curr) => {
        acc[getKeyNameFromAttribute(curr)] = getObjectFromNode(curr)
        return acc
      }, {})
    } else {
      throw new Error(`Did not recognize ${curr}`)
    }

    acc[getKeyNameFromAttribute(curr)] = value
    return acc
  }, {})

  return props
}

module.exports = getObjectFromNode
module.exports.getValueFromNode = getValueFromNode
