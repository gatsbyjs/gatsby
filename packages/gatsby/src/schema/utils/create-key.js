const capitalize = require(`./capitalize`)

const createKey = key =>
  key
    .split(`.`)
    .map(capitalize)
    .join(``)
    .replace(/^\d|[^\w]/g, `_`)

module.exports = createKey
