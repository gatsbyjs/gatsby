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
      fieldName: field.name,
      innerFields: [`id`],
    }
  }

  // pull the id for connections
  if (field.type.relationShipField && !field.type.mediaItem) {
    return {
      fieldName: field.name,
      innerFields: [`id`],
    }
  }

  // pull the id and sourceUrl for connections to media items
  if (field.type.relationShipField && field.type.mediaItem) {
    return {
      fieldName: field.name,
      innerFields: [`id`, `sourceUrl`],
    }
  }

  // if this field has fields,
  if (field.type && field.type.fields) {
    return {
      fieldName: field.name,
      innerFields: field.type.fields
        // time to recurse!
        .map(field =>
          transformField({
            field,
            nodeListTypeNames,
          })
        )
        // remove null fields that we omitted above
        .filter(Boolean),
    }
  }

  return field.name
}

export const buildNodesQueryOnFieldName = ({
  fields,
  fieldName,
  nodeListTypeNames,
}) =>
  buildQuery({
    queryName: `NODE_LIST_QUERY`,
    variables: `$first: Int!, $after: String`,
    fieldName,
    fieldVariables: `first: $first, after: $after`,
    fields: [
      {
        fieldName: `pageInfo`,
        innerFields: [`hasNextPage`, `endCursor`],
      },
      {
        fieldName: `nodes`,
        innerFields: fields
          .map(field => transformField({ field, nodeListTypeNames }))
          .filter(Boolean),
      },
    ],
  })

const buildVariables = variables =>
  variables && typeof variables === `string` ? `(${variables})` : ``

const buildSelectionSet = ({ fields }) =>
  fields
    .map(field => {
      if (typeof field === `string`) {
        return field
      }

      const { fieldName, variables, innerFields } = field

      if (fieldName && innerFields) {
        return `
            ${fieldName} ${buildVariables(variables)} {
              ${buildSelectionSet({ fields: innerFields })}
            }
          `
      }

      return null
    })
    .filter(Boolean).join(`
    `)

const buildQuery = ({
  queryName,
  fieldName,
  fieldVariables,
  variables,
  fields,
}) => `
  query ${queryName} ${buildVariables(variables)} {
    ${fieldName} ${buildVariables(fieldVariables)} {
      ${buildSelectionSet({ fields })}
    }
  }
`

export const buildNodeQueryOnFieldName = ({
  fields,
  fieldName,
  nodeListTypeNames,
}) =>
  buildQuery({
    queryName: `SINGLE_CONTENT_QUERY`,
    variables: `$id: ID!`,
    fieldName,
    fieldVariables: `id: $id`,
    fields: fields
      .map(field => transformField({ field, nodeListTypeNames }))
      .filter(Boolean),
  })
