const getUniqueValuesBy = (items, predicate) => {
  const entries = items.reduce((acc, item) => {
    const value = predicate(item)
    if (!acc.has(value)) {
      acc.set(value, item)
    }
    return acc
  }, new Map())
  return Array.from(entries.values())
}

module.exports = getUniqueValuesBy
