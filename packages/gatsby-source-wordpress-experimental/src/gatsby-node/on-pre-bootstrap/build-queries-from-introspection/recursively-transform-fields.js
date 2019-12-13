import store from "../../../store"

const { fieldBlacklist } = store.getState().introspection

const filterField = ({ field, nodeListTypeNames }) => {
  const fieldType = field.type || {}
  const ofType = fieldType.ofType || {}

  if (!field) {
    return false
  }

  if (
    field.args.length &&
    // remove fields that have required args. They'll cause query errors if ommitted
    //  and we can't determine how to use those args programatically.
    field.args.find(arg => arg && arg.type && arg.type.kind === `NON_NULL`)
  ) {
    return false
  }

  // if we're recursing and we have infinite relational data
  // for which we have no top-level nodes,
  // and the level we've recursed to is too far down to have a next level
  // don't query for this field
  if (fieldType.kind === `OBJECT` && !fieldType.fields) {
    return false
  }

  if (fieldType.kind === `LIST` && ofType.kind !== `SCALAR`) {
    return null
  }

  if (fieldBlacklist.includes(field.name)) {
    return false
  }

  const gatsbyNodeExists = nodeListTypeNames.find(type => type === ofType.name)

  if (
    fieldType.kind === `LIST` &&
    ofType.kind !== `SCALAR` &&
    !gatsbyNodeExists
  ) {
    // for now remove relational lists unless we've already created Gatsby nodes from this type
    // @todo possibly make nodes out of these fields by fetching the node from the connection field. Not sure if this will work yet or not
    return false
  }

  // if (fieldType.kind === `UNION`) {
  //   // @todo our query builder wont allow us to use fragments. Need to do something custom instead of using graphql-query-builder, or fork it and add support
  //   return false
  // }

  // if this is a connection field
  if (fieldType.name && fieldType.name.includes(`Connection`)) {
    // get the list of nodes on this field
    const nodesSubField = fieldType.fields.find(field => field.name === `nodes`)

    // remove this field if there are no nodes to get
    if (!nodesSubField) {
      return false
    }

    // check if we will have Gatsby nodes of this type
    const connectionIsAGatsbyNode =
      nodesSubField &&
      nodeListTypeNames.find(
        type =>
          !!nodesSubField.type.ofType && type === nodesSubField.type.ofType.name
      )

    // remove connections that aren't to Gatsby nodes
    return !connectionIsAGatsbyNode
  }

  return true
}

const transformFragments = ({ possibleTypes, nodeListTypeNames }) =>
  possibleTypes
    .map(possibleType => {
      const isAGatsbyNode = nodeListTypeNames.includes(possibleType.name)

      if (isAGatsbyNode) {
        possibleType.fields = [`id`]
        return possibleType
      }

      // @todo handle types that aren't Gatsby node types
      return false
    })
    .filter(Boolean)

const transformField = ({ field, nodeListTypeNames }) => {
  const fieldType = field.type || {}

  const isAGatsbyNode = nodeListTypeNames.includes(field.type.name)
  const isAMediaItemNode = isAGatsbyNode && field.type.name === `MediaItem`

  // pull the id and sourceUrl for connections to media items
  if (isAMediaItemNode) {
    return {
      fieldName: field.name,
      innerFields: [`id`, `sourceUrl`],
    }
  }

  // pull the id for connections
  if (isAGatsbyNode) {
    return {
      fieldName: field.name,
      innerFields: [`id`],
    }
  }

  if (fieldType.kind === `UNION`) {
    return {
      fieldName: field.name,
      innerFragments: transformFragments({
        possibleTypes: fieldType.possibleTypes,
        nodeListTypeNames,
      }),
    }
  }

  if (fieldType.fields) {
    return {
      fieldName: field.name,
      innerFields: recursivelyTransformFields({
        fields: field.type.fields,
        nodeListTypeNames,
      }),
    }
  }

  return field.name
}

const recursivelyTransformFields = ({ fields, nodeListTypeNames }) =>
  fields
    .filter(field =>
      filterField({
        field,
        nodeListTypeNames,
      })
    )
    .map(field => transformField({ field, nodeListTypeNames }))

export default recursivelyTransformFields
