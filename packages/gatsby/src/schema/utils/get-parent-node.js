const { getById } = require(`../db`)
const { getParentNodeId } = require(`./node-tracking`)

const getParentNode = obj =>
  (obj && (obj.id != null && getById(obj.id))) || getById(getParentNodeId(obj))

module.exports = getParentNode
