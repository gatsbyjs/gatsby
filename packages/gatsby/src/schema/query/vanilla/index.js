const filter = require(`./filter`)
const sort = require(`./sort`)

const { isObject } = require(`../../utils`)

const getQueryOperators = () => null

const dropQueryOperators = filter =>
  Object.entries(filter).reduce((acc, [key, value]) => {
    if (!isObject(value)) {
      acc[key] = true
    } else {
      acc[key] = dropQueryOperators(value)
    }
    return acc
  }, {})

const equals = value => value

const oneOf = value => value

const query = (nodes = [], args, firstResultOnly) => {
  if (firstResultOnly) {
    return args.filter ? filter(nodes, args.filter, firstResultOnly) : nodes[0]
  }

  const filtered = args.filter ? filter(nodes, args, firstResultOnly) : nodes
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
