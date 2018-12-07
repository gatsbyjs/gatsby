const invariant = require(`invariant`)

const capitalize = require(`./capitalize`)

// TODO: Rename to createTypeName??? Or what do we use it for?
const createTypeName = selector => {
  const key = selector
    .split(`.`)
    .map(capitalize)
    .join(``)
    .replace(/^\d|[^\w]/g, `_`)

  invariant(
    !key.startsWith(`__`),
    `GraphQL does not allow names starting with double underscore.`
  )

  return key
}

module.exports = createTypeName
