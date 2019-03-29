const _ = require(`lodash`)
const { GraphQLList, GraphQLNonNull } = require(`graphql`)
const { UnionTypeComposer, ObjectTypeComposer } = require(`graphql-compose`)

export const mergeInferredComposer = ({
  schemaComposer,
  definedComposer,
  inferredComposer,
}) => {
  const addDefaultResolvers =
    definedComposer.getExtension(`addDefaultResolvers`) || true

  inferredComposer.getFieldNames().forEach(fieldName => {
    const inferredField = inferredComposer.getField(fieldName)
    if (definedComposer.hasField(fieldName)) {
      maybeExtendDefinedField({
        schemaComposer,
        definedComposer,
        inferredComposer,
        fieldName,
        addDefaultResolvers,
      })
    } else {
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
  addDefaultResolvers,
}) => {
  const inferredField = inferredComposer.getField(fieldName)

  let inferredFieldComposer
  try {
    inferredFieldComposer = inferredComposer.getFieldTC(fieldName)
  } catch (e) {
    inferredFieldComposer = null
  }
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

    if (inferredFieldComposer instanceof UnionTypeComposer) {
      if (!schemaComposer.has(inferredFieldComposer.getTypeName())) {
        schemaComposer.addAsComposer(inferredFieldComposer)
      }
    } else if (
      inferredFieldComposer instanceof ObjectTypeComposer &&
      !inferredFieldComposer.hasInterface(`Node`)
    ) {
      const definedFieldComposer = schemaComposer.getOrCreateOTC(
        inferredFieldComposer.getTypeName()
      )
      if (
        !definedFieldComposer.hasExtension(`infer`) ||
        definedFieldComposer.getExtension(`infer`)
      ) {
        schemaComposer.set(
          definedFieldComposer.getTypeName(),
          mergeInferredComposer({
            schemaComposer,
            definedComposer: definedFieldComposer,
            inferredComposer: inferredFieldComposer,
          })
        )
      }
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
    return left.name === right.name
  }
}
