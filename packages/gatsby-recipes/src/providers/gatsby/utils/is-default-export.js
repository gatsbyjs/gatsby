const t = require(`@babel/types`)

module.exports = node => {
  if (!node || !t.isMemberExpression(node)) {
    return false
  }

  const { object, property } = node

  if (!t.isIdentifier(object) || object.name !== `module`) return false
  if (!t.isIdentifier(property) || property.name !== `exports`) return false

  return true
}
