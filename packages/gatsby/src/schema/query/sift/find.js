const sift = require(`sift`)

const find = (filters, nodes = []) => {
  const index = sift.indexOf({ $and: filters }, nodes)
  return index !== -1 ? nodes[index] : null
}

module.exports = find
