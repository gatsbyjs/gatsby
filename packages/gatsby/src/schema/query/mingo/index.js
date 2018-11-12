const mingo = require(`mingo`)

const { prepareQueryArgs } = require(`../sift/query-args`)
const {
  dropQueryOperators,
  equals,
  getQueryOperators,
  oneOf,
} = require(`../sift`)

const query = (nodes = [], args, firstResultOnly) => {
  const filter = args.filter ? prepareQueryArgs(args.filter) : {}

  const query = new mingo.Query(filter)

  if (firstResultOnly) {
    return nodes.find(node => query.test(node))
  }

  const sorted = query.find(nodes).sort(args.sort)
  // .all()
  const count = sorted.length
  const items = sorted.skip(args.skip).limit(args.limit)
  return { items, count }
}

module.exports = {
  dropQueryOperators,
  equals,
  getQueryOperators,
  oneOf,
  query,
}
