const _ = require(`lodash`)
const { GraphQLList, GraphQLNonNull, GraphQLObjectType } = require(`graphql`)
const { ObjectTypeComposer } = require(`graphql-compose`)
const report = require(`gatsby-cli/lib/reporter`)

/**
  Combined types defined in `createTypes` and types inferred from the data.

  This is called assuming we already inferred the type, so when we don't infer,
  this doesn't need to be called. Because we have to accomodate legacy logic,
  stuff is a bit more complex. With 3.0 we can remove all the extra code except
  the one that adds the fields.

  Algorithm in brief:

  * for every field not present in definedComposer, but present in
    inferredComposer, add it. If the type of field is unknown, add it to
    composer.

  * legacy - won't add new fields if "dontAddFields" are true all (for
    `@dontInfer(noDefaultResolvers: false)`) case

  * for fields that are present in definedComposer, we merge them together.
    This is needed so that if we have inline object type, we can recurse into it
    add add inferred fields to it too. When recursing, we inherit infer config,
    unless inline type has those defined

  * legacy - add extensions, args and resolvers for fields that match the type,
    but don't have those. For `noDefaultResolvers: false` cases
 */
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
  } else if (
    definedComposer.hasExtension(`infer`) &&
    !definedComposer.hasExtension(`addDefaultResolvers`)
  ) {
    addDefaultResolvers = false
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
    if (addDefaultResolvers && !extensions.addResolver) {
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
      if (inferredField.extensions.addResolver) {
        report.warn(
          `Deprecation warning - adding inferred resolver for field ${definedComposer.getTypeName()}.${fieldName}. In Gatsby 3, only fields with a "addResolver" directive/extension will get a resolver.`
        )
        definedComposer.setFieldExtension(
          fieldName,
          `addResolver`,
          inferredField.extensions.addResolver
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
