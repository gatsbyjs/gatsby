import { dd, dump } from "dumper.js"

const fieldBlacklist = [`postTypeInfo`]

const filterField = ({ field, parentField, nodeListTypeNames }) => {
  const fieldType = field.type || {}
  const ofType = fieldType.ofType || {}

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

  if (fieldType.kind === `UNION`) {
    // @todo our query builder wont allow us to use fragments. Need to do something custom instead of using graphql-query-builder, or fork it and add support
    return false
  }

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
      nodeListTypeNames.find(type => type === nodesSubField.type.ofType.name)

    // remove connections that aren't to Gatsby nodes
    return !connectionIsAGatsbyNode
  }

  return true
}

const transformField = ({ field, nodeListTypeNames }) => {
  const fieldType = field.type || {}

  // if we're recursing and we have infinite relational data
  // for which we have no top-level nodes,
  // and the level we've recursed to is too far down to have a next level
  // don't query for this field
  if (fieldType.kind === `OBJECT` && !fieldType.fields) {
    return null
  }

  if (nodeListTypeNames.includes(field.type.name)) {
    // this is a node from another root node list that we will make a node from
    // let's just turn this into an ID
    // to do that we just pull the WPGQL id for now
    fieldType.relationShipField = true
    if (fieldType.fields) {
      fieldType.fields = fieldType.fields.filter(
        innerField =>
          innerField.name === `id` || innerField.name === `sourceUrl`
      )
    }
  }
  // else if (fieldType.fields && fieldType.fields.find(field => field.)) {

  // }
  else if (fieldType.fields) {
    fieldType.fields = fieldType.fields
      .filter(innerField =>
        filterField({
          field: innerField,
          parentField: field,
          nodeListTypeNames,
        })
      )
      .filter(f => !!f)
      .map(field => transformField({ field, nodeListTypeNames }))
  }

  // // for nested fields that are connections
  // // but there is no nodes field to get id's from
  // // we don't want this field
  // fieldType.fields = fieldType.fields
  //   ? fieldType.fields.filter(field => {
  //       if (
  //         !!field &&
  //         field.type &&
  //         field.type.name &&
  //         field.type.name.includes(`Connection`)
  //       ) {
  //         return field.type.fields.find(field => field.name === `nodes`)
  //       }

  //       return true
  //     })
  //   : null

  if (!fieldType.fields || !fieldType.fields.length) {
    delete fieldType.fields
  }
  // else if (
  //   fieldType.kind !== `NON_NULL` &&
  //   fieldType.kind !== `SCALAR` &&
  //   fieldType.kind !== `LIST` &&
  //   fieldType.kind !== `OBJECT` &&
  //   fieldType.kind !== `ENUM`
  // ) {
  //   dd(field)
  // }

  // if (field.name === `actionMonitorActions`) {
  //   dd(field.type.fields.filter(field => field.name !== `pageInfo`))
  // }

  // if (
  //   fieldType &&
  //   fieldType.kind === `LIST` &&
  //   fieldType.ofType &&
  //   fieldType.ofType.name &&
  //   types.find(type => type.name === fieldType.ofType.name)
  // ) {
  //   // this is a type that isn't in a root field node list
  //   // so we need to query it directly instead of creating a node relationship.
  //   // but we need to grab it's possible fields from the type introspection
  //   // and add them here since we don't have them
  //   const type = types.find(type => type.name === fieldType.ofType.name)
  //   console.log(`here it is!`)
  //   dd(type)
  // }
  return field
}

const recursivelyTransformFields = ({ field, fields, nodeListTypeNames }) =>
  fields
    ? fields
        .filter(innerField =>
          filterField({
            field: innerField,
            parentField: field,
            nodeListTypeNames,
          })
        )
        .filter(f => !!f)
        .map(innerField =>
          transformField({ field: innerField, nodeListTypeNames })
        )
    : null

export default recursivelyTransformFields
