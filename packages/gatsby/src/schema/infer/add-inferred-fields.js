const _ = require(`lodash`)
const {
  GraphQLList,
  GraphQLObjectType,
  defaultFieldResolver,
  getNamedType,
} = require(`graphql`)
const invariant = require(`invariant`)

const { isFile } = require(`./is-file`)
const { link, fileByPath } = require(`../resolvers`)
const { isDate, dateResolver } = require(`../types/Date`)
const is32BitInteger = require(`./is-32-bit-integer`)

const addInferredFields = ({
  schemaComposer,
  typeComposer,
  exampleValue,
  nodeStore,
  inferConfig,
  typeMapping,
  parentSpan,
}) => {
  if (!inferConfig || inferConfig.infer) {
    addInferredFieldsImpl({
      schemaComposer,
      typeComposer,
      nodeStore,
      exampleObject: exampleValue,
      prefix: typeComposer.getTypeName(),
      typeMapping: typeMapping,
      addDefaultResolvers: inferConfig ? inferConfig.addDefaultResolvers : true,
      depth: 0,
    })
  }
}

module.exports = {
  addInferredFields,
}

const addInferredFieldsImpl = ({
  schemaComposer,
  typeComposer,
  nodeStore,
  exampleObject,
  typeMapping,
  prefix,
  depth,
  addDefaultResolvers,
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
    if (hasMapping(typeMapping, selector)) {
      // TODO: Use `prefix` instead of `selector` in hasMapping and getFromMapping?
      // i.e. does the config contain sanitized field names?
      fieldConfig = getFieldConfigFromMapping(typeMapping, selector)
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
        depth,
        typeMapping
      )
    }

    while (arrays--) {
      fieldConfig = { ...fieldConfig, type: [fieldConfig.type] }
    }

    // Proxy resolver to unsanitized fieldName in case it contained invalid characters
    if (key !== unsanitizedKey) {
      // Don't create a field with the sanitized key if a field with that name already exists.
      invariant(
        exampleObject[key] == null && !typeComposer.hasField(key),
        `Invalid key ${unsanitizedKey} on ${prefix}. GraphQL field names must ` +
          `only contain characters matching /^[a-zA-Z][_a-zA-Z0-9]*$/. and ` +
          `must not start with a double underscore.`
      )

      const resolver = fieldConfig.resolve || defaultFieldResolver
      fieldConfig = {
        ...fieldConfig,
        resolve: (source, args, context, info) =>
          resolver(source, args, context, {
            ...info,
            fieldName: unsanitizedKey,
          }),
      }
    }

    if (typeComposer.hasField(key)) {
      let fieldType = typeComposer.getFieldType(key)
      if (_.isPlainObject(value) /* && depth < MAX_DEPTH */) {
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
            typeMapping,
            nodeStore,
            prefix: selector,
            depth: depth + 1,
            addDefaultResolvers: true,
          })
        }
      }
      let field = typeComposer.getField(key)
      if (
        addDefaultResolvers &&
        getNamedType(fieldType).name === fieldConfig.type
      ) {
        if (!field.type) {
          field = {
            type: field,
          }
        }
        if (_.isEmpty(field.args) && fieldConfig.args) {
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

  Object.keys(fields).forEach(fieldName => {
    typeComposer.setField(fieldName, fields[fieldName])
  })
  return typeComposer
}

// XXX(freiksenet): removing this as it's a breaking change
// Deeper nested levels should be inferred as JSON.
// const MAX_DEPTH = 5

const hasMapping = (mapping, selector) =>
  mapping && Object.keys(mapping).includes(selector)

const getFieldConfigFromMapping = (mapping, selector) => {
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
    `Encountered an error trying to infer a GraphQL type for: "${key}". There is no corresponding node with the id field matching: "${value}".`
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
    type = schemaComposer.getOrCreateUTC(typeName, utc => {
      const types = linkedTypes.map(typeName =>
        schemaComposer.getOrCreateTC(typeName)
      )
      utc.setTypes(types)
      utc.setResolveType(node => node.internal.type)
    })
  } else {
    type = linkedTypes[0]
  }

  return { type, resolve: link({ by: foreignKey || `id`, from: key }) }
}

const getFieldConfig = (
  schemaComposer,
  nodeStore,
  value,
  selector,
  depth,
  typeMapping
) => {
  switch (typeof value) {
    case `boolean`:
      return { type: `Boolean` }
    case `number`:
      return { type: is32BitInteger(value) ? `Int` : `Float` }
    case `string`:
      if (isDate(value)) {
        return dateResolver
      }
      // FIXME: The weird thing is that we are trying to infer a File,
      // but cannot assume that a source plugin for File nodes is actually present.
      if (schemaComposer.has(`File`) && isFile(nodeStore, selector, value)) {
        // NOTE: For arrays of files, where not every path references
        // a File node in the db, it is semi-random if the field is
        // inferred as File or String, since the exampleValue only has
        // the first entry (which could point to an existing file or not).
        return { type: `File`, resolve: fileByPath }
      }
      return { type: `String` }
    case `object`:
      if (value instanceof Date) {
        return dateResolver
      }
      if (value instanceof String) {
        return { type: `String` }
      }
      if (value /* && depth < MAX_DEPTH*/) {
        return {
          type: addInferredFieldsImpl({
            schemaComposer,
            typeComposer: schemaComposer.getOrCreateTC(
              createTypeName(selector)
            ),
            nodeStore,
            exampleObject: value,
            typeMapping,
            prefix: selector,
            depth: depth + 1,
          }),
        }
      }
  }
  throw new Error(`Can't determine type for \`${value}\` in \`${selector}\`.`)
}

const createTypeName = selector => {
  const key = selector
    .split(`.`)
    .map(_.upperFirst)
    .join(``)

  return key
}

const NON_ALPHA_NUMERIC_EXPR = new RegExp(`[^a-zA-Z0-9_]`, `g`)

/**
 * GraphQL field names must be a string and cannot contain anything other than
 * alphanumeric characters and `_`. They also can't start with `__` which is
 * reserved for internal fields (`___foo` doesn't work either).
 */
const createFieldName = key => {
  // Check if the key is really a string otherwise GraphQL will throw.
  invariant(
    typeof key === `string`,
    `Graphql field name (key) is not a string -> ${key}`
  )

  const replaced = key.replace(NON_ALPHA_NUMERIC_EXPR, `_`)

  // key is invalid; normalize with leading underscore and rest with x
  if (replaced.match(/^__/)) {
    return replaced.replace(/_/g, (char, index) => (index === 0 ? `_` : `x`))
  }

  // key is invalid (starts with numeric); normalize with leading underscore
  if (replaced.match(/^[0-9]/)) {
    return `_` + replaced
  }

  return replaced
}
