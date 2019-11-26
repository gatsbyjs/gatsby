import { dd } from "dumper.js"

const filterField = field => {
  const fieldType = field.type || {}
  const ofType = fieldType.ofType || {}

  if (fieldType.kind === `LIST` && ofType.kind !== `SCALAR`) {
    // for now remove relational lists
    return false
  }

  if (fieldType.kind === `UNION`) {
    return false
  }

  if (fieldType.name && fieldType.name.includes(`Connection`)) {
    // dd(field)
    // and connections
    return false
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
      .filter(filterField)
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

const recursivelyTransformFields = ({ fields, nodeListTypeNames }) =>
  fields
    ? fields
        .filter(filterField)
        .filter(f => !!f)
        .map(field => transformField({ field, nodeListTypeNames }))
    : null

export default recursivelyTransformFields
