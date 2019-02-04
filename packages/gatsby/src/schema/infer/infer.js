const _ = require(`lodash`)
const {
  GraphQLList,
  GraphQLObjectType,
  defaultFieldResolver,
  getNamedType,
  assertValidName,
} = require(`graphql`)
const invariant = require(`invariant`)

const { isFile } = require(`./is-file`)
const { link } = require(`../resolvers`)
const { isDate, dateResolver } = require(`../types/Date`)
const is32BitInteger = require(`./is-32-bit-integer`)

const { store } = require(`../../redux`)

const addInferredFields = ({
  schemaComposer,
  typeComposer,
  exampleValue,
  nodeStore,
  parentSpan,
}) =>
  addInferredFieldsImpl({
    schemaComposer,
    typeComposer,
    nodeStore,
    exampleObject: exampleValue,
    prefix: typeComposer.getTypeName(),
    depth: 0,
  })

module.exports = {
  addInferredFields,
}

const addInferredFieldsImpl = ({
  schemaComposer,
  typeComposer,
  nodeStore,
  exampleObject,
  prefix,
  depth,
}) => {
  const fields = {}
  Object.keys(exampleObject).forEach(unsanitizedKey => {
    const exampleValue = exampleObject[unsanitizedKey]
    let key = createFieldName(unsanitizedKey)
    const selector = `${prefix}.${key}`

    let arrays = 0
    let value = exampleValue
    while (Array.isArray(value)) {
      value = value[0]
      arrays++
    }

    let fieldConfig
    if (hasMapping(selector)) {
      // TODO: Use `prefix` instead of `selector` in hasMapping and getFromMapping?
      // i.e. does the config contain sanitized field names?
      fieldConfig = getFieldConfigFromMapping(selector)
    } else if (key.includes(`___NODE`)) {
      fieldConfig = getFieldConfigFromFieldNameConvention(
        schemaComposer,
        nodeStore,
        exampleValue,
        unsanitizedKey
      )
      key = key.split(`___NODE`)[0]
    } else {
      fieldConfig = getFieldConfig(
        schemaComposer,
        nodeStore,
        value,
        selector,
        depth
      )
    }

    if (fieldConfig === `Date`) {
      fieldConfig = dateResolver
    }

    fieldConfig = fieldConfig.type ? fieldConfig : { type: fieldConfig }

    while (arrays--) {
      fieldConfig = { ...fieldConfig, type: [fieldConfig.type] }
    }

    // Proxy resolver to unsanitized fieldName in case it contained invalid characters
    if (key !== unsanitizedKey) {
      // Don't create a field with the sanitized key if a field with that name already exists
      invariant(
        exampleObject[key] == null && !typeComposer.hasField(key),
        `Invalid key ${unsanitizedKey} on ${prefix}. GraphQL field names must ` +
          `only contain characters matching /^[a-zA-Z][_a-zA-Z0-9]*$/. and ` +
          `must not start with a double underscore.`
      )

      const resolver = fieldConfig.resolve || defaultFieldResolver
      fieldConfig.resolve = (source, args, context, info) =>
        resolver(source, args, context, {
          ...info,
          fieldName: unsanitizedKey,
        })
    }

    if (typeComposer.hasField(key)) {
      let fieldType = typeComposer.getFieldType(key)
      if (_.isObject(value) /* && depth < MAX_DEPTH */) {
        // TODO: Use helper (similar to dropTypeModifiers)
        let lists = 0
        while (fieldType.ofType) {
          if (fieldType instanceof GraphQLList) lists++
          fieldType = fieldType.ofType
        }

        if (lists === arrays && fieldType instanceof GraphQLObjectType) {
          addInferredFieldsImpl({
            schemaComposer,
            typeComposer: typeComposer.getFieldTC(key),
            exampleObject: value,
            nodeStore,
            prefix: selector,
            depth: depth + 1,
          })
        }
      }
      let field = typeComposer.getField(key)
      if (getNamedType(fieldType).name === fieldConfig.type) {
        if (!field.type) {
          field = {
            type: field,
          }
        }
        if (field.type === fieldConfig.type)
          if (!field.args && fieldConfig.args) {
            field.args = fieldConfig.args
          }
        if (!field.resolve && fieldConfig.resolve) {
          field.resolve = fieldConfig.resolve
        }
        typeComposer.setField(key, field)
      }
    } else {
      fields[key] = fieldConfig
    }
  })

  Object.keys(fields).forEach(fieldName =>
    typeComposer.setField(fieldName, fields[fieldName])
  )
  return typeComposer
}

// XXX(freiksenet): removing this as it's a breaking change
// Deeper nested levels should be inferred as JSON.
// const MAX_DEPTH = 5

const hasMapping = selector => {
  const { mapping } = store.getState().config
  return mapping && Object.keys(mapping).includes(selector)
}

const getFieldConfigFromMapping = selector => {
  const { mapping } = store.getState().config
  const [type, ...path] = mapping[selector].split(`.`)
  return { type, resolve: link({ by: path.join(`.`) || `id` }) }
}

// probably should be in example value
const getFieldConfigFromFieldNameConvention = (
  schemaComposer,
  nodeStore,
  value,
  key
) => {
  const path = key.split(`___NODE___`)[1]
  // Allow linking by nested fields, e.g. `author___NODE___contact___email`
  const foreignKey = path && path.replace(/___/g, `.`)

  const getNodeBy = value =>
    foreignKey
      ? nodeStore.getNodes().find(node => _.get(node, foreignKey) === value)
      : nodeStore.getNode(value)

  const linkedNodes = Array.isArray(value)
    ? value.map(getNodeBy)
    : [getNodeBy(value)]

  const linkedTypes = _.uniq(
    linkedNodes.filter(Boolean).map(node => node.internal.type)
  )

  invariant(
    linkedTypes.length,
    `Could not infer a GraphQL type for the field "${key}".`
  )

  let type
  // If the field value is an array that links to more than one type,
  // create a GraphQLUnionType. Note that we don't support the case where
  // scalar fields link to different types. Similarly, an array of objects
  // with foreign-key fields will produce union types if those foreign-key
  // fields are arrays, but not if they are scalars. See the tests for an example.
  // FIXME: The naming of union types is a breaking change. In current master,
  // the type name includes the key, which is (i) potentially not unique, and
  // (ii) hinders reusing types.
  if (linkedTypes.length > 1) {
    const typeName = linkedTypes.sort().join(``) + `Union`
    schemaComposer.getOrCreateUTC(typeName, utc => {
      const types = linkedTypes.map(typeName =>
        schemaComposer.getOrCreateTC(typeName)
      )
      utc.setTypes(types)
      types.forEach(type => {
        utc.addTypeResolver(
          type,
          obj => obj.internal.type === type.getTypeName()
        )
      })
    })
  } else {
    type = linkedTypes[0]
  }

  return { type, resolve: link({ by: foreignKey || `id` }) }
}

const getFieldConfig = (schemaComposer, nodeStore, value, selector, depth) => {
  switch (typeof value) {
    case `boolean`:
      return `Boolean`
    case `number`:
      return is32BitInteger(value) ? `Int` : `Float`
    case `string`:
      if (isDate(value)) {
        return `Date`
      }
      // FIXME: The weird thing is that we are trying to infer a File,
      // but cannot assume that a source plugin for File nodes is actually present.
      if (schemaComposer.has(`File`) && isFile(nodeStore, selector, value)) {
        // NOTE: For arrays of files, where not every path references
        // a File node in the db, it is semi-random if the field is
        // inferred as File or String, since the exampleValue only has
        // the first entry (which could point to an existing file or not).
        return { type: `File`, resolve: link({ by: `relativePath` }) }
      }
      return `String`
    case `object`:
      if (value instanceof Date) {
        return `Date`
      }
      if (value instanceof String) {
        return `String`
      }
      if (value /* && depth < MAX_DEPTH*/) {
        return addInferredFieldsImpl({
          schemaComposer,
          typeComposer: schemaComposer.getOrCreateTC(createTypeName(selector)),
          nodeStore,
          exampleObject: value,
          prefix: selector,
          depth: depth + 1,
        })
      }
      return `JSON`
    default:
      // null
      return `JSON`
  }
}

const createTypeName = selector => {
  const key = selector
    .split(`.`)
    .map(_.upperFirst)
    .join(``)

  return key
}

const createFieldName = str => {
  const name = str.replace(/^\d|[^\w]/g, `_`)
  assertValidName(name)

  return name
}
