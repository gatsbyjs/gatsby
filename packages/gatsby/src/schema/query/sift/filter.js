const sift = require(`sift`)

const filter = (filters, nodes) => sift({ $and: filters }, nodes)

module.exports = filter
