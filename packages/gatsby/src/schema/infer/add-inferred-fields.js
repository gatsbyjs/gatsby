const _ = require(`lodash`)
const {
  defaultFieldResolver,
  getNamedType,
  GraphQLObjectType,
  GraphQLList,
} = require(`graphql`)
const { ObjectTypeComposer } = require(`graphql-compose`)
const invariant = require(`invariant`)
const report = require(`gatsby-cli/lib/reporter`)

const { isFile } = require(`./is-file`)
const { link, fileByPath } = require(`../resolvers`)
const { isDate, dateResolver } = require(`../types/date`)
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
  addInferredFieldsImpl({
    schemaComposer,
    typeComposer,
    nodeStore,
    exampleObject: exampleValue,
    prefix: typeComposer.getTypeName(),
    typeMapping,
    addNewFields: inferConfig ? inferConfig.infer : true,
    addDefaultResolvers: inferConfig ? inferConfig.addDefaultResolvers : true,
  })
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
  addNewFields,
  addDefaultResolvers,
}) => {
  const fields = []
  Object.keys(exampleObject).forEach(unsanitizedKey => {
    const exampleValue = exampleObject[unsanitizedKey]
    fields.push(
      getFieldConfig({
        schemaComposer,
        typeComposer,
        nodeStore,
        prefix,
        exampleValue,
        unsanitizedKey,
        typeMapping,
        addNewFields,
        addDefaultResolvers,
      })
    )
  })

  const fieldsByKey = _.groupBy(fields, field => field.key)

  Object.keys(fieldsByKey).forEach(key => {
    const possibleFields = fieldsByKey[key]
    let fieldConfig
    if (possibleFields.length > 1) {
      const field = resolveMultipleFields(possibleFields)
      const possibleFieldsNames = possibleFields
        .map(field => `\`${field.unsanitizedKey}\``)
        .join(`, `)
      report.warn(
        `Multiple node fields resolve to the same GraphQL field \`${prefix}.${
          field.key
        }\` - [${possibleFieldsNames}]. Gatsby will use \`${
          field.unsanitizedKey
        }\`.`
      )
      fieldConfig = field.fieldConfig
    } else {
      fieldConfig = possibleFields[0].fieldConfig
    }

    let arrays = 0
    let namedInferredType = fieldConfig.type
    while (Array.isArray(namedInferredType)) {
      namedInferredType = namedInferredType[0]
      arrays++
    }

    if (typeComposer.hasField(key)) {
      const fieldType = typeComposer.getFieldType(key)

      let lists = 0
      let namedFieldType = fieldType
      while (namedFieldType.ofType) {
        if (namedFieldType instanceof GraphQLList) {
          lists++
        }
        namedFieldType = namedFieldType.ofType
      }

      const namedInferredTypeName =
        typeof namedInferredType === `string`
          ? namedInferredType
          : namedInferredType.getTypeName()

      if (arrays === lists && namedFieldType.name === namedInferredTypeName) {
        if (
          namedFieldType instanceof GraphQLObjectType &&
          namedInferredType instanceof ObjectTypeComposer
        ) {
          const fieldTypeComposer = typeComposer.getFieldTC(key)
          const inferredFields = namedInferredType.getFields()
          fieldTypeComposer.addFields(inferredFields)
        }
        if (addDefaultResolvers) {
          let field = typeComposer.getField(key)
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
      }
    } else if (addNewFields) {
      if (namedInferredType instanceof ObjectTypeComposer) {
        schemaComposer.add(namedInferredType)
      }
      typeComposer.setField(key, fieldConfig)
    }
  })

  return typeComposer
}

const getFieldConfig = ({
  schemaComposer,
  typeComposer,
  nodeStore,
  prefix,
  exampleValue,
  unsanitizedKey,
  typeMapping,
  addNewFields,
  addDefaultResolvers,
}) => {
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
    fieldConfig = getFieldConfigFromMapping({ typeMapping, selector })
  } else if (key.includes(`___NODE`)) {
    fieldConfig = getFieldConfigFromFieldNameConvention({
      schemaComposer,
      nodeStore,
      value: exampleValue,
      key: unsanitizedKey,
    })
    key = key.split(`___NODE`)[0]
  } else {
    fieldConfig = getSimpleFieldConfig({
      schemaComposer,
      typeComposer,
      nodeStore,
      key,
      value,
      selector,
      typeMapping,
      addNewFields,
      addDefaultResolvers,
    })
  }

  // Proxy resolver to unsanitized fieldName in case it contained invalid characters
  if (key !== unsanitizedKey) {
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

  while (arrays > 0) {
    fieldConfig = { ...fieldConfig, type: [fieldConfig.type] }
    arrays--
  }

  return {
    key,
    unsanitizedKey,
    fieldConfig,
  }
}

const resolveMultipleFields = possibleFields => {
  const nodeField = possibleFields.find(field =>
    field.unsanitizedKey.includes(`___NODE`)
  )
  if (nodeField) {
    return nodeField
  }

  const canonicalField = possibleFields.find(
    field => field.unsanitizedKey === field.key
  )
  if (canonicalField) {
    return canonicalField
  }

  return _.sortBy(possibleFields, field => field.unsanitizedKey)[0]
}

// XXX(freiksenet): removing this as it's a breaking change
// Deeper nested levels should be inferred as JSON.
// const MAX_DEPTH = 5

const hasMapping = (mapping, selector) =>
  mapping && Object.keys(mapping).includes(selector)

const getFieldConfigFromMapping = ({ typeMapping, selector }) => {
  const [type, ...path] = typeMapping[selector].split(`.`)
  return { type, resolve: link({ by: path.join(`.`) || `id` }) }
}

// probably should be in example value
const getFieldConfigFromFieldNameConvention = ({
  schemaComposer,
  nodeStore,
  value,
  key,
}) => {
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
    `Encountered an error trying to infer a GraphQL type for: \`${key}\`. ` +
      `There is no corresponding node with the \`id\` field matching: "${value}".`
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
        schemaComposer.getOrCreateOTC(typeName)
      )
      utc.setTypes(types)
      utc.setResolveType(node => node.internal.type)
    })
  } else {
    type = linkedTypes[0]
  }

  return { type, resolve: link({ by: foreignKey || `id` }) }
}

const getSimpleFieldConfig = ({
  schemaComposer,
  typeComposer,
  nodeStore,
  key,
  value,
  selector,
  typeMapping,
  addNewFields,
  addDefaultResolvers,
}) => {
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
        // We only create a temporary TypeComposer on nested fields
        // (either a clone of an existing field type, or a temporary new one),
        // because we don't yet know if this type should end up in the schema.
        // It might be for a possibleField that will be disregarded later,
        // so we cannot mutate the original.
        let fieldTypeComposer
        if (
          typeComposer.hasField(key) &&
          getNamedType(typeComposer.getFieldType(key)) instanceof
            GraphQLObjectType
        ) {
          const originalFieldTypeComposer = typeComposer.getFieldTC(key)
          fieldTypeComposer = originalFieldTypeComposer.clone(
            originalFieldTypeComposer.getTypeName()
          )
        } else {
          fieldTypeComposer = ObjectTypeComposer.createTemp(
            createTypeName(selector),
            schemaComposer
          )
        }

        return {
          type: addInferredFieldsImpl({
            schemaComposer,
            typeComposer: fieldTypeComposer,
            nodeStore,
            exampleObject: value,
            typeMapping,
            prefix: selector,
            addNewFields,
            addDefaultResolvers,
          }),
        }
      }
  }
  throw new Error(`Can't determine type for "${value}" in \`${selector}\`.`)
}

const createTypeName = selector => {
  const keys = selector.split(`.`)
  const suffix = keys
    .slice(1)
    .map(_.upperFirst)
    .join(``)
  return `${keys[0]}${suffix}`
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
    `GraphQL field name (key) is not a string: \`${key}\`.`
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
