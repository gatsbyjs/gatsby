const _ = require(`lodash`)
const { GraphQLList, GraphQLNonNull, GraphQLObjectType } = require(`graphql`)
const { ObjectTypeComposer } = require(`graphql-compose`)

export const mergeInferredComposer = ({
  schemaComposer,
  definedComposer,
  inferredComposer,
  dontAddFields,
  addDefaultResolvers,
}) => {
  if (dontAddFields == null && definedComposer.hasExtension(`infer`)) {
    const infer = definedComposer.getExtension(`infer`)
    dontAddFields = !infer ? true : dontAddFields
  }

  if (
    addDefaultResolvers == null &&
    definedComposer.hasExtension(`addDefaultResolvers`)
  ) {
    addDefaultResolvers = definedComposer.getExtension(`addDefaultResolvers`)
  } else {
    addDefaultResolvers = true
  }

  inferredComposer.getFieldNames().forEach(fieldName => {
    const inferredField = inferredComposer.getField(fieldName)
    if (definedComposer.hasField(fieldName)) {
      maybeExtendDefinedField({
        schemaComposer,
        definedComposer,
        inferredComposer,
        fieldName,
        dontAddFields,
        addDefaultResolvers,
      })
    } else if (!dontAddFields) {
      const inferredFieldComposer = inferredComposer.getFieldTC(fieldName)
      const typeName = inferredFieldComposer.getTypeName()
      if (schemaComposer.has(typeName)) {
        const wrappedType = mapType(
          inferredComposer.getFieldType(fieldName),
          () => schemaComposer.get(typeName).getType()
        )
        inferredField.type = wrappedType
      } else {
        schemaComposer.addAsComposer(inferredFieldComposer)
      }
      definedComposer.addFields({ [fieldName]: inferredField })
    }
  })

  if (!definedComposer.hasExtension(`createdFrom`)) {
    definedComposer.setExtension(
      `createdFrom`,
      inferredComposer.getExtension(`createFrom`)
    )
    definedComposer.setExtension(
      `plugin`,
      inferredComposer.getExtension(`plugin`)
    )
  }

  return definedComposer
}

const maybeExtendDefinedField = ({
  schemaComposer,
  definedComposer,
  inferredComposer,
  fieldName,
  dontAddFields,
  addDefaultResolvers,
}) => {
  const inferredField = inferredComposer.getField(fieldName)

  const definedFieldComposer = definedComposer.getFieldTC(fieldName)
  const inferredFieldComposer = inferredComposer.getFieldTC(fieldName)

  const definedField = definedComposer.getField(fieldName)
  if (
    typesLooselyEqual(
      inferredComposer.getFieldType(fieldName),
      definedComposer.getFieldType(fieldName)
    )
  ) {
    const extensions = definedComposer.getFieldExtensions(fieldName)
    if (addDefaultResolvers && !definedField.resolver && !extensions.resolver) {
      const config = {}
      if (
        (!definedField.args || _.isEmpty(definedField.args)) &&
        inferredField.args
      ) {
        config.args = inferredField.args
      }

      if (inferredField.resolve) {
        config.resolve = inferredField.resolve
      }

      definedComposer.extendField(fieldName, config)
      if (inferredField.extensions.resolver) {
        definedComposer.setFieldExtension(
          fieldName,
          `resolver`,
          inferredField.extensions.resolver
        )
        definedComposer.setFieldExtension(
          fieldName,
          `resolverOptions`,
          inferredField.extensions.resolverOptions
        )
      }
    }

    if (
      inferredFieldComposer instanceof ObjectTypeComposer &&
      !inferredFieldComposer.hasInterface(`Node`) &&
      definedFieldComposer instanceof ObjectTypeComposer &&
      !definedFieldComposer.hasInterface(`Node`) &&
      (!definedFieldComposer.hasExtension(`infer`) ||
        definedFieldComposer.getExtension(`infer`))
    ) {
      schemaComposer.set(
        definedFieldComposer.getTypeName(),
        mergeInferredComposer({
          schemaComposer,
          definedComposer: definedFieldComposer,
          inferredComposer: inferredFieldComposer,
          dontAddFields,
          addDefaultResolvers,
        })
      )
    }
  }
}

const typesLooselyEqual = (left, right) => {
  if (left instanceof GraphQLList && right instanceof GraphQLList) {
    return typesLooselyEqual(left.ofType, right.ofType)
  } else if (left instanceof GraphQLNonNull) {
    return typesLooselyEqual(left.ofType, right)
  } else if (right instanceof GraphQLNonNull) {
    return typesLooselyEqual(left, right.ofType)
  } else {
    return (
      left.name === right.name ||
      (left instanceof GraphQLObjectType && right instanceof GraphQLObjectType)
    )
  }
}

const mapType = (type, fn) => {
  if (type instanceof GraphQLList) {
    return new GraphQLList(mapType(type.ofType, fn))
  } else if (type instanceof GraphQLNonNull) {
    return new GraphQLNonNull(mapType(type.ofType, fn))
  } else {
    return fn(type)
  }
}
