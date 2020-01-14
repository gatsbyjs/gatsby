import store from "../../../store"

const { fieldBlacklist, fieldAliases } = store.getState().introspection

const transformFragments = ({
  possibleTypes,
  gatsbyNodesInfo,
  typeMap,
  maxDepth,
  depth,
}) =>
  possibleTypes
    ? possibleTypes
        .map(possibleType => {
          const type = typeMap.get(possibleType.name)

          if (!type) {
            return false
          }

          const isAGatsbyNode = gatsbyNodesInfo.typeNames.includes(
            possibleType.name
          )

          if (isAGatsbyNode) {
            // we use the id to link to the top level Gatsby node
            possibleType.fields = [`id`]
            return possibleType
          }

          const typeInfo = typeMap.get(possibleType.name)

          if (typeInfo) {
            const fields = recursivelyTransformFields({
              fields: typeInfo.fields,
              gatsbyNodesInfo,
              typeMap,
              maxDepth,
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

function transformField({ field, gatsbyNodesInfo, typeMap, maxDepth, depth }) {
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

  // this is used to alias fields that conflict with Gatsby node fields
  // for ex Gatsby and WPGQL both have a `parent` field
  const fieldName =
    fieldAliases && fieldAliases[field.name]
      ? `${fieldAliases[field.name]}: ${field.name}`
      : field.name

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
    field.args.find(arg => arg && arg.type && arg.type.kind === `NON_NULL`)
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
    return fieldName
  }

  const isListOfGatsbyNodes =
    ofType && gatsbyNodesInfo.typeNames.includes(ofType.name)

  if (fieldType.kind === `LIST` && isListOfGatsbyNodes) {
    return {
      fieldName: fieldName,
      fields: [`id`],
    }
  } else if (fieldType.kind === `LIST`) {
    const listOfType = typeMap.get(ofType.name)

    const transformedFields = recursivelyTransformFields({
      fields: listOfType.fields,
      gatsbyNodesInfo,
      typeMap,
      depth,
      maxDepth,
    })

    const transformedFragments = transformFragments({
      possibleTypes: listOfType.possibleTypes,
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
    }
  }

  const isAGatsbyNode = gatsbyNodesInfo.typeNames.includes(fieldType.name)
  const isAMediaItemNode = isAGatsbyNode && fieldType.name === `MediaItem`

  // pull the id and sourceUrl for connections to media item gatsby nodes
  if (isAMediaItemNode) {
    return {
      fieldName: fieldName,
      fields: [`id`, `sourceUrl`],
    }
  } else if (isAGatsbyNode) {
    // just pull the id for connections to other gatsby nodes
    return {
      fieldName: fieldName,
      fields: [`id`],
    }
  }

  const typeInfo = typeMap.get(fieldType.name)
  const { fields } = typeInfo

  if (fields) {
    const transformedFields = recursivelyTransformFields({
      fields,
      gatsbyNodesInfo,
      typeMap,
      depth,
      maxDepth,
    })

    if (!transformedFields || !transformedFields.length) {
      return false
    }

    return {
      fieldName: fieldName,
      fields: transformedFields,
    }
  }

  if (fieldType.kind === `UNION`) {
    const typeInfo = typeMap.get(fieldType.name)

    const transformedFields = recursivelyTransformFields({
      fields: typeInfo.fields,
      gatsbyNodesInfo,
      typeMap,
      depth,
      maxDepth,
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
    }
  }

  return false
}

const recursivelyTransformFields = ({
  fields,
  gatsbyNodesInfo,
  typeMap,
  maxDepth,
  depth = 0,
}) =>
  fields
    ? fields
        .map(field =>
          transformField({
            field,
            gatsbyNodesInfo,
            typeMap,
            maxDepth,
            depth,
          })
        )
        .filter(Boolean)
    : null

export default recursivelyTransformFields
