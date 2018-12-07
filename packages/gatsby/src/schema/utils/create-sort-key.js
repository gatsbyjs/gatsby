const toSnakeCase = require(`./to-snake-case`)

const createSortKey = (key, delimiter) =>
  key &&
  key
    .split(`.`)
    .map(toSnakeCase)
    .join(delimiter)
    .replace(/^\d|[^\w]/g, `_`)
    .toUpperCase()

module.exports = createSortKey
