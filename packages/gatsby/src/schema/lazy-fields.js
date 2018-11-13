const _ = require(`lodash`)
const { GraphQLList } = require(`graphql`)

// Note: fields are never deleted from here. So a long running
// `develop` session, where nodes are being deleted might mean that
// fields exist here that aren't on any DB nodes anymore. This isn't
// ideal, BUT, the worst case is that queries will be executed by
// sift, rather than loki, so not a big deal
const typeFields = new Map()

function contains(filters, gqlType) {
  return _.some(filters, (value, fieldName) => {
    const storedFields = typeFields.get(gqlType.name)
    if (storedFields && storedFields.has(fieldName)) {
      return true
    } else {
      const field = gqlType.getFields()[fieldName]
      const { elemMatch } = value
      if (field.type instanceof GraphQLList && elemMatch) {
        return _.some(elemMatch, (value, fieldName) => {
          // This is disgusting, but works
          const innerType = field.type.ofType.getFields()[fieldName].type.ofType
          return contains({ [fieldName]: value }, innerType)
        })
      }
      return false
    }
  })
}

function add(typeName, fieldName) {
  if (typeFields.get(typeName)) {
    typeFields.get(typeName).add(fieldName)
  } else {
    typeFields.set(typeName, new Set([fieldName]))
  }
}

module.exports = {
  contains,
  add,
}
