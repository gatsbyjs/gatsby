import { findNamedTypeName } from "~/steps/create-schema-customization/helpers"

import { buildGatsbyNodeObjectResolver } from "~/steps/create-schema-customization/transform-fields/transform-object"
import { buildTypeName } from "../helpers"

export const buildDefaultResolver = transformerApi => (source, _, context) => {
  const { fieldName, field, gatsbyNodeTypes, pluginOptions } = transformerApi
  const prefix = pluginOptions.schema.typePrefix

  let finalFieldValue

  const resolvedField = source[fieldName]

  if (typeof resolvedField !== `undefined`) {
    finalFieldValue = resolvedField
  }

  const autoAliasedFieldPropertyName = `${fieldName}__typename_${field?.type?.name}`

  const aliasedField = source[autoAliasedFieldPropertyName]

  if (
    typeof resolvedField === `undefined` &&
    typeof aliasedField !== `undefined`
  ) {
    finalFieldValue = aliasedField
  }

  // the findNamedTypeName helpers was written after this resolver
  // had been in production for a while.
  // so we don't know if in all cases it will find the right typename
  // for this resolver..
  // So the old way of doing it is above in autoAliasedFieldPropertyName
  // @todo write comprehesive data resolution integration tests
  // using many different WPGraphQL extensions
  // then come back and remove the `return aliasedField` line and
  // see if this still resolves everything properly
  const typeName = findNamedTypeName(field.type)
  const autoAliasedFieldName = `${fieldName}__typename_${typeName}`

  const aliasedField2 = source[autoAliasedFieldName]

  if (
    typeof resolvedField === `undefined` &&
    typeof aliasedField2 !== `undefined`
  ) {
    finalFieldValue = aliasedField2
  }

  if (finalFieldValue?.__typename) {
    // in Gatsby V3 this property is used to determine the type of an interface field
    // instead of the resolveType fn. This means we need to prefix it so that gql doesn't throw errors about missing types.
    finalFieldValue.__typename = buildTypeName(
      finalFieldValue.__typename,
      prefix
    )
  }

  const isANodeConnection =
    // if this field has just an id and typename
    finalFieldValue?.id &&
    finalFieldValue?.__typename &&
    Object.keys(finalFieldValue).length === 2 &&
    // and it's a Gatsby Node type
    gatsbyNodeTypes.includes(finalFieldValue.__typename)

  if (isANodeConnection) {
    const gatsbyNodeResolver = buildGatsbyNodeObjectResolver(transformerApi)
    return gatsbyNodeResolver(source, _, context)
  }

  return finalFieldValue
}
