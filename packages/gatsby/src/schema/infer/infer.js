const { schemaComposer } = require(`graphql-compose`)
const { GraphQLList, GraphQLObjectType } = require(`graphql`)

const { isFile } = require(`./is-file`)
const { link } = require(`../resolvers`)
const {
  createSelector,
  createTypeName,
  is32bitInteger,
  isDate,
  isObject,
} = require(`../utils`)

// Deeper nested levels should be inferred as JSON.
const MAX_DEPTH = 3

const addInferredFields = (tc, value, prefix, depth = 0) => {
  const fields = Object.entries(value).reduce((acc, [key, value]) => {
    const selector = createSelector(prefix, key)

    let arrays = 0
    while (Array.isArray(value)) {
      value = value[0]
      arrays++
    }

    if (tc.hasField(key)) {
      if (isObject(value) /* && depth < MAX_DEPTH */) {
        let lists = 0
        let fieldType = tc.getFieldType(key)
        while (fieldType.ofType) {
          fieldType instanceof GraphQLList && lists++
          fieldType = fieldType.ofType
        }

        if (lists === arrays && fieldType instanceof GraphQLObjectType) {
          addInferredFields(tc.getFieldTC(key), value, selector, depth + 1)
        }
      }
      return acc
    }

    let fieldConfig
    switch (typeof value) {
      case `boolean`:
        fieldConfig = `Boolean`
        break
      case `number`:
        fieldConfig = is32bitInteger(value) ? `Int` : `Float`
        break
      case `string`:
        if (isDate(value)) {
          fieldConfig = `Date`
          break
        }
        if (schemaComposer.has(`File`) && isFile(selector, value)) {
          // NOTE: For arrays of files, where not every path references
          // a File node in the db, it is semi-random if the field is
          // inferred as File or String, since the exampleValue only has
          // the first entry (which could point to an existing file or not).
          fieldConfig = {
            type: `File`,
            resolve: link({ by: `relativePath` }),
          }
          break
        }
        fieldConfig = `String`
        break
      case `object`:
        if (value instanceof Date) {
          fieldConfig = `Date`
          break
        }
        if (value instanceof String) {
          fieldConfig = `String`
          break
        }
        if (value && depth < MAX_DEPTH) {
          fieldConfig = addInferredFields(
            schemaComposer.getOrCreateTC(createTypeName(selector)),
            value,
            selector,
            depth + 1
          )
          break
        }
        fieldConfig = `JSON`
        break
      default:
        // null
        fieldConfig = `JSON`
    }

    // There is currently no non-hacky way to programmatically add
    // directives to fields.
    if (fieldConfig === `Date`) {
      fieldConfig = {
        type: `Date`,
        astNode: {
          kind: `FieldDefinition`,
          directives: [
            {
              arguments: [],
              kind: `Directive`,
              name: { kind: `Name`, value: `dateformat` },
            },
          ],
        },
      }
    }

    while (arrays--) {
      fieldConfig = fieldConfig.type
        ? { ...fieldConfig, type: [fieldConfig.type] }
        : [fieldConfig]
    }

    acc[key] = fieldConfig

    return acc
  }, {})

  Object.entries(fields).forEach(([fieldName, fieldConfig]) =>
    tc.setField(fieldName, fieldConfig)
  )
  return tc
}

module.exports = {
  addInferredFields,
}
