const toSnakeCase = require(`./to-snake-case`)

const createSortKey = (key, delimiter) =>
  key &&
  key
    .split(`.`)
    .map(toSnakeCase)
    .join(delimiter)
    .replace(/^\d|[^\w]/g, `_`)
// FIXME: Enum values should be uppercase
// .toUpperCase()

module.exports = createSortKey
