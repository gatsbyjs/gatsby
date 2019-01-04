// A normal Graphql field resolver will accept a node as an argument
// and return a field from that node. Whereas a lazy field will need
// to perform some side effects or non-deterministic behavior to
// return its value. Therefore, when a query filter includes a lazy
// field, we need to evaluate the field resolvers on all nodes before
// running the query. Examples of lazy fields include:
//
// - a markdown `wordcount` field (lazily calculates word count on its
//   content)
// - image sharp processing field (lazily generates optimized images)
//
// Lazy fields are declared using the exported `add` function. This
// should be done during schema generation when fields are being
// created. Then at query time, we can use the exported `contains`
// function to figure out if a type/field pair is lazy, and therefore
// use sift for querying instead of loki

const _ = require(`lodash`)
const { GraphQLList, GraphQLObjectType } = require(`graphql`)

// Note: fields are never deleted from here. So a long running
// `develop` session, where nodes are being deleted might mean that
// fields exist here that aren't on any DB nodes anymore. This isn't
// ideal, BUT, the worst case is that queries will be executed by
// sift, rather than loki, so not a big deal
const typeFields = new Map()

function contains(filters, fieldType) {
  return _.some(filters, (fieldFilter, fieldName) => {
    // If a field has been previously flagged as a lazy field, then
    // return true
    const storedFields = typeFields.get(fieldType.name)
    if (storedFields && storedFields.has(fieldName)) {
      return true
    } else {
      // Otherwise, the filter field might be an array of linked
      // nodes, in which case we might filter via an elemMatch
      // field. Or, it might be a nested linked object. In either
      // case, we recurse
      const gqlFieldType = fieldType.getFields()[fieldName]?.type
      if (gqlFieldType) {
        if (gqlFieldType instanceof GraphQLList && fieldFilter.elemMatch) {
          return contains(fieldFilter.elemMatch, gqlFieldType.ofType)
        } else if (gqlFieldType instanceof GraphQLObjectType) {
          return contains(fieldFilter, gqlFieldType)
        }
      }
    }
    return false
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
