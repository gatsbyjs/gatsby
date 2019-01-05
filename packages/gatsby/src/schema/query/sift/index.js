const { default: sift, indexOf: siftFirst } = require(`sift`)

const sort = require(`./sort`)
const getQueryOperators = require(`./query-operators`)
const { dropQueryOperators, prepareQueryArgs } = require(`./query-args`)

/* eslint-disable-next-line arrow-body-style */
const equals = value => ({ eq: value })

/* eslint-disable-next-line arrow-body-style */
const oneOf = value => ({ in: value })

const filter = (filters, nodes) => sift({ $and: filters }, nodes)

const find = (filters, nodes) => {
  const index = siftFirst({ $and: filters }, nodes)
  return index !== -1 ? nodes[index] : null
}

const getFilters = filters =>
  Object.entries(filters).reduce(
    (acc, [key, value]) => acc.push({ [key]: value }) && acc,
    []
  )

const query = (nodes = [], args, firstResultOnly) => {
  const filters = args.filter ? getFilters(prepareQueryArgs(args.filter)) : []

  if (firstResultOnly) {
    return filters.length ? find(filters, nodes) : nodes[0]
  }

  const filtered = filters.length ? filter(filters, nodes) : nodes
  const sorted = args.sort ? filtered.sort(sort(args.sort)) : filtered
  const count = sorted.length
  const items = sorted.slice(
    args.skip || 0,
    args.limit && (args.skip || 0) + args.limit
  )
  return { items, count }
}

module.exports = {
  dropQueryOperators,
  equals,
  getQueryOperators,
  oneOf,
  query,
}
