import Query from "graphql-query-builder"
import { dd } from "dumper.js"
const transformField = field => {
  if (
    field.args.length &&
    // remove fields that have required args, as they'll cause build errors
    field.args.find(arg => arg && arg.type && arg.type.kind === `NON_NULL`)
  ) {
    return null
  }

  // temp remove unions
  if (field.type && field.type.kind === `UNION`) {
    return null
  }

  // temp remove lists
  if (field.type.kind === `LIST`) {
    return null
  }

  // just pull the id for fields that are connections to other nodes
  if (field.type.relationShipField) {
    return {
      [field.name]: [`id`],
    }
  }

  // if this field has fields,
  if (field.type && field.type.fields) {
    return {
      [field.name]: field.type.fields
        // time to recurse!
        .map(transformField)
        // remove null fields
        .filter(f => !!f),
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
