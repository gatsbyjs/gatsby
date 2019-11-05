const recursivelyTransformFields = ({ fields, nodeListTypeNames }) =>
  fields
    .filter(field => {
      const fieldType = field.type || {}
      const ofType = fieldType.ofType || {}
      // for now remove relational lists
      if (fieldType.kind === `LIST` && ofType.kind !== `SCALAR`) {
        return false
      }

      if (
        field.type &&
        field.type.name &&
        field.type.name.includes(`Connection`)
      ) {
        // and connections
        return false
      }

      return true
    })
    .map(field => {
      if (nodeListTypeNames.includes(field.type.name)) {
        // this is a node from another root node list that we will make a node from
        // let's just turn this into an ID
        // to do that we just pull the WPGQL id for now
        field.type.relationShipField = true
        field.type.fields = field.type.fields.filter(
          innerField =>
            innerField.name === `id` || innerField.name === `sourceUrl`
        )
      }

      // if (
      //   field.type &&
      //   field.type.kind === `LIST` &&
      //   field.type.ofType &&
      //   field.type.ofType.name &&
      //   types.find(type => type.name === field.type.ofType.name)
      // ) {
      //   // this is a type that isn't in a root field node list
      //   // so we need to query it directly instead of creating a node relationship.
      //   // but we need to grab it's possible fields from the type introspection
      //   // and add them here since we don't have them
      //   const type = types.find(type => type.name === field.type.ofType.name)
      //   console.log(`here it is!`)
      //   dd(type)
      // }

      if (field.type.fields) {
        field.type.field = field.type.fields.map(innerField => {
          // recurse once. this should be turned into a recursive function that loops down through and replaces any top level node fields with just an id field as many levels deep as we ask for in our query.
          if (nodeListTypeNames.includes(innerField.type.name)) {
            innerField.type.relationShipField = true
            innerField.type.fields = innerField.type.fields.filter(
              innerField2 => innerField2.name === `id`
            )
          }
          return field
        })
      }
      return field
    })

export default recursivelyTransformFields
