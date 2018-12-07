const createSelector = (prefix, key) =>
  key && (prefix ? `${prefix}.${key}` : key)

module.exports = createSelector
