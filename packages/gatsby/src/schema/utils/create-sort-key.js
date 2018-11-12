const createSortKey = (key, delimiter) =>
  key
    .split(`.`)
    .join(delimiter)
    .replace(/^\d|[^\w]/g, `_`)
    .toUpperCase()

module.exports = createSortKey
