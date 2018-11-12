const isObject = require(`../../utils`)

const filter = (filters, nodes, firstResultOnly) => {
  const test = (filters = {}, node) =>
    Object.entries(filters).every(([key, value]) => {
      if (isObject(value) && isObject(node[key])) {
        return test(value, node[key])
      }
      if (Array.isArray(node[key])) {
        return node[key].some(item => test(value, item))
      }
      if (Array.isArray(value)) {
        return value.includes(node[key])
      }
      return node[key] === value
    })
  const op = firstResultOnly ? `find` : `filter`
  return nodes[op](node => test(filters, node))
}

module.exports = filter
