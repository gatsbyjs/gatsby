import store from "~/store"
import { getTypeSettingsByType } from "~/steps/create-schema-customization/helpers"
import { fieldIsExcludedOnParentType } from "~/steps/ingest-remote-schema/is-excluded"
import { returnAliasedFieldName } from "~/steps/create-schema-customization/transform-fields"

const transformFragments = ({
  possibleTypes,
  gatsbyNodesInfo,
  typeMap,
  depth,
  maxDepth,
  parentType,
}) =>
  possibleTypes && depth <= maxDepth
    ? possibleTypes
        .map(possibleType => {
          const type = typeMap.get(possibleType.name)

          if (!type) {
            return false
          }

          possibleType.type = type

          // save this type so we can use it in schema customization
          store.dispatch.remoteSchema.addFetchedType(type)

          const isAGatsbyNode = gatsbyNodesInfo.typeNames.includes(
            possibleType.name
          )

          if (isAGatsbyNode) {
            // we use the id to link to the top level Gatsby node
            possibleType.fields = [`id`]
            return possibleType
          }

          const typeInfo = typeMap.get(possibleType.name)

          let filteredFields = [...typeInfo.fields]

          if (parentType?.kind === `INTERFACE`) {
            // remove any fields from our fragment if the parent type already has them as shared fields
            filteredFields = filteredFields.filter(
              filteredField =>
                !parentType.fields.find(
                  parentField => parentField.name === filteredField.name
                )
            )
          }

          if (typeInfo) {
            const fields = recursivelyTransformFields({
              fields: filteredFields,
              parentType: type,
              depth,
            })

            if (!fields || !fields.length) {
              return false
            }

            possibleType.fields = fields
            return possibleType
          }

          return false
        })
        .filter(Boolean)
    : null

function transformField({
  field,
  gatsbyNodesInfo,
  typeMap,
  maxDepth,
  depth,
  fieldBlacklist,
  fieldAliases,
} = {}) {
  // we're potentially infinitely recursing when fields are connected to other types that have fields that are connections to other types
  //  so we need a maximum limit for that
  if (depth >= maxDepth) {
    return false
  }

  depth++

  // if the field has no type we can't use it.
  if (!field || !field.type) {
    return false
  }

  const typeSettings = getTypeSettingsByType(field.type)

  if (typeSettings.exclude || typeSettings.nodeInterface) {
    return false
  }

  // this is used to alias fields that conflict with Gatsby node fields
  // for ex Gatsby and WPGQL both have a `parent` field
  const fieldName = returnAliasedFieldName({ fieldAliases, field })

  if (
    fieldBlacklist.includes(field.name) ||
    fieldBlacklist.includes(fieldName)
  ) {
    return false
  }

  // remove fields that have required args. They'll cause query errors if ommitted
  //  and we can't determine how to use those args programatically.
  if (
    field.args &&
    field.args.length &&
    field.args.find(arg => arg?.type?.kind === `NON_NULL`)
  ) {
    return false
  }

  const fieldType = field.type || {}
  const ofType = fieldType.ofType || {}

  if (
    fieldType.kind === `SCALAR` ||
    (fieldType.kind === `NON_NULL` && ofType.kind === `SCALAR`) ||
    (fieldType.kind === `LIST` && fieldType.ofType.kind === `SCALAR`)
  ) {
    return {
      fieldName,
      fieldType,
    }
  }

  const isListOfGatsbyNodes =
    ofType && gatsbyNodesInfo.typeNames.includes(ofType.name)
  const isListOfMediaItems =
    (ofType && ofType.name === `MediaItem`) ??
    (ofType?.ofType && ofType.ofType.name === `MediaItem`)

  if (fieldType.kind === `LIST` && isListOfGatsbyNodes && !isListOfMediaItems) {
    return {
      fieldName: fieldName,
      fields: [`id`],
      fieldType,
    }
  } else if (fieldType.kind === `LIST` && isListOfMediaItems) {
    return {
      fieldName: fieldName,
      fields: [`id`, `sourceUrl`],
      fieldType,
    }
  } else if (fieldType.kind === `LIST`) {
    const listOfType = typeMap.get(ofType.name || ofType.ofType.name)

    const transformedFields = recursivelyTransformFields({
      fields: listOfType.fields,
      parentType: listOfType || fieldType,
      depth,
    })

    const transformedFragments = transformFragments({
      possibleTypes: listOfType.possibleTypes,
      parentType: listOfType || fieldType,
      gatsbyNodesInfo,
      typeMap,
      depth,
      maxDepth,
    })

    if (
      !transformedFields &&
      transformedFragments &&
      !transformedFragments.length
    ) {
      return false
    }

    if (
      !transformedFragments &&
      transformedFields &&
      !transformedFields.length
    ) {
      return false
    }

    // if we have either fragments or fields
    return {
      fieldName: fieldName,
      fields: transformedFields,
      fragments: transformedFragments,
      fieldType,
    }
  }

  const isAGatsbyNode = gatsbyNodesInfo.typeNames.includes(fieldType.name)
  const isAMediaItemNode = isAGatsbyNode && fieldType.name === `MediaItem`

  // pull the id and sourceUrl for connections to media item gatsby nodes
  if (isAMediaItemNode) {
    return {
      fieldName: fieldName,
      fields: [`id`, `sourceUrl`],
      fieldType,
    }
  } else if (isAGatsbyNode) {
    // just pull the id for connections to other gatsby nodes
    return {
      fieldName: fieldName,
      fields: [`id`],
      fieldType,
    }
  }

  const typeInfo = typeMap.get(fieldType.name)

  const { fields } = typeInfo || {}

  if (fields) {
    const transformedFields = recursivelyTransformFields({
      parentType: fieldType,
      fields,
      depth,
    })

    if (!transformedFields || !transformedFields.length) {
      return false
    }

    return {
      fieldName: fieldName,
      fields: transformedFields,
      fieldType,
    }
  }

  if (fieldType.kind === `UNION`) {
    const typeInfo = typeMap.get(fieldType.name)

    const transformedFields = recursivelyTransformFields({
      fields: typeInfo.fields,
      parentType: fieldType,
      depth,
    })

    const fragments = transformFragments({
      possibleTypes: typeInfo.possibleTypes,
      gatsbyNodesInfo,
      typeMap,
      depth,
      maxDepth,
    })

    return {
      fieldName: fieldName,
      fields: transformedFields,
      fragments,
      fieldType,
    }
  }

  return false
}

const recursivelyTransformFields = ({ fields, parentType, depth = 0 }) => {
  const {
    gatsbyApi: { pluginOptions },
    remoteSchema: { fieldBlacklist, fieldAliases, typeMap, gatsbyNodesInfo },
  } = store.getState()

  const {
    schema: { queryDepth },
  } = pluginOptions

  if (depth >= queryDepth) {
    return null
  }

  return fields
    ? fields
        .filter(
          field =>
            !fieldIsExcludedOnParentType({ pluginOptions, field, parentType })
        )
        .map(field => {
          const transformedField = transformField({
            maxDepth: queryDepth,
            gatsbyNodesInfo,
            fieldBlacklist,
            fieldAliases,
            typeMap,
            field,
            depth,
          })

          if (transformedField) {
            // save this type so we know to use it in schema customization
            store.dispatch.remoteSchema.addFetchedType(field.type)
          }

          return transformedField
        })
        .filter(Boolean)
    : null
}

export default recursivelyTransformFields
