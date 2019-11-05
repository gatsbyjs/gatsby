import Query from "graphql-query-builder"

const transformField = field => {
  if (field.type && field.type.kind === `UNION`) {
    return null
  }

  if (field.type && field.type.fields) {
    return {
      [field.name]: field.type.fields
        .map(innerField => {
          if (innerField.type.kind === `LIST`) {
            return null
          }
          if (innerField.type.relationShipField) {
            return {
              [innerField.name]: [`id`],
            }
          }
          if (innerField.type.fields) {
            return {
              [innerField.name]: innerField.type.fields.map(
                innerField2 => innerField2.name
              ),
            }
          }
          return innerField.name
        })
        .filter(innerField => !!innerField),
    }
  }

  return field.name
}

export const buildNodesQueryOnFieldName = ({ fields, fieldName }) => {
  // this builds the gql query
  let queryField = new Query(fieldName, {
    $variables: true,
  })

  // this adds subfields to our query
  queryField.find([
    {
      pageInfo: [`hasNextPage`, `endCursor`],
    },
    {
      nodes: fields.map(transformField).filter(field => !!field),
    },
  ])

  const queryString = queryField
    .toString()
    // add pagination variables.
    .replace(`$variables:true`, `first: $first, after: $after`)
  // can't figure out how to properly do this ^ in graphql-query-builder.
  // just replacing a placeholder for now.

  return queryString
}
export const buildNodeQueryOnFieldName = ({ fields, fieldName }) => {
  // this builds the gql query
  let queryField = new Query(fieldName)
  console.log(fieldName)
  console.log(fields)

  const queryFields = fields.map(transformField).filter(field => !!field)

  // this adds subfields to our query
  queryField.find(queryFields)

  return queryField.toString()
}
