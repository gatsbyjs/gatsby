import Query from "graphql-query-builder"

const transformField = ({ field, nodeListTypeNames }) => {
  if (!field) {
    return null
  }

  if (
    field.args.length &&
    // remove fields that have required args. They'll cause query errors if ommitted
    //  and we can't determine how to use those args programatically.
    field.args.find(arg => arg && arg.type && arg.type.kind === `NON_NULL`)
  ) {
    return null
  }

  // temp remove unions. graphql-query-builder doesn't seem to support them
  // probably need to do something custom instead of using that package
  if (field.type && field.type.kind === `UNION`) {
    return null
  }

  if (field.type.kind === `LIST` && field.type.ofType.kind !== `SCALAR`) {
    return null
  }

  // just pull the node id for lists we have nodes for
  if (
    field.type.kind === `LIST` &&
    nodeListTypeNames.includes(field.type.ofType.name)
  ) {
    return {
      [field.name]: [`id`],
    }
  }

  // pull the id and sourceUrl for connections to media items
  if (field.type.relationShipField && field.type.mediaItem) {
    return {
      [field.name]: [`id`, `sourceUrl`],
    }
  }

  // if this field has fields,
  if (field.type && field.type.fields) {
    return {
      [field.name]: field.type.fields
        // time to recurse!
        .map(field => transformField({ field, nodeListTypeNames }))
        // remove null fields that we omitted above
        .filter(f => !!f),
    }
  }

  return field.name
}

export const buildNodesQueryOnFieldName = ({
  fields,
  fieldName,
  nodeListTypeNames,
}) => {
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
      nodes: fields
        .map(field => transformField({ field, nodeListTypeNames }))
        .filter(field => !!field),
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
export const buildNodeQueryOnFieldName = ({
  fields,
  fieldName,
  nodeListTypeNames,
}) => {
  // this builds the gql query
  let queryField = new Query(fieldName, { id: `$id` })

  const queryFields = fields
    .map(field => transformField({ field, nodeListTypeNames }))
    .filter(field => !!field)

  // this adds subfields to our query
  queryField.find(queryFields)

  return `query SINGLE_CONTENT_QUERY($id: ID!) {${queryField
    .toString()
    .replace(`"$id"`, `$id`)}}`
}
