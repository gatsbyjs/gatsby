const createSelector = (prefix, key) => (prefix ? `${prefix}.${key}` : key)

module.exports = createSelector
