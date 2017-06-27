const _ = require(`lodash`)

module.exports = str => {
  const exploded = str.split(`/`)
  const regex = new RegExp(exploded.slice(1, -1).join(`/`), _.last(exploded))
  return regex
}
