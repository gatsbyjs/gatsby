// FIXME:
// const { getNode, getNodes, getNodesByType } = require(`../../db/nodes`)
const { getNode, getNodes, getNodesByType } = require(`./redux`)

// The `id` field can already be resolved to a full node.
// In that case just return it.
// Alternatively, put this logic in the findById(s) resolvers,
// and every call to getById should instead be to findById.
// One possible advantage of that could be
// that we can abstract it into a HOC together with the logic
// in `link()`, which also needs to check if a link is already resolved
// to a node.
// TODO: isObject()
const getById = id =>
  id != null ? (typeof id === `object` ? id : getNode(id)) : null

module.exports = {
  getById,
  getNodes,
  getNodesByType,
}
