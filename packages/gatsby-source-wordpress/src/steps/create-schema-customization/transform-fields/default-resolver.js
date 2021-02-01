import { findTypeName } from "~/steps/create-schema-customization/helpers"

import { buildGatsbyNodeObjectResolver } from "~/steps/create-schema-customization/transform-fields/transform-object"

export const buildDefaultResolver = transformerApi => (source, _, context) => {
  const { fieldName, field, gatsbyNodeTypes } = transformerApi

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

  // the findTypeName helpers was written after this resolver
  // had been in production for a while.
  // so we don't know if in all cases it will find the right typename
  // for this resolver..
  // So the old way of doing it is above in autoAliasedFieldPropertyName
  // @todo write comprehesive data resolution integration tests
  // using many different WPGraphQL extensions
  // then come back and remove the `return aliasedField` line and
  // see if this still resolves everything properly
  const typeName = findTypeName(field.type)
  const autoAliasedFieldName = `${fieldName}__typename_${typeName}`

  const aliasedField2 = source[autoAliasedFieldName]

  if (
    typeof resolvedField === `undefined` &&
    typeof aliasedField2 !== `undefined`
  ) {
    finalFieldValue = aliasedField2
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
