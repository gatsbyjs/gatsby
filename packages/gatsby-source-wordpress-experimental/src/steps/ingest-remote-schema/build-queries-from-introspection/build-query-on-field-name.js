import compress from "graphql-query-compress"

export const buildNodesQueryOnFieldName = ({
  fields,
  fieldName,
  settings,
  queryVariables = ``,
  fieldVariables = ``,
}) =>
  compress(
    buildQuery({
      queryName: `NODE_LIST_QUERY`,
      variables: `$first: Int!, $after: String, ${queryVariables}`,
      fieldName,
      fieldVariables: `first: $first, after: $after, ${fieldVariables}`,
      fields: [
        {
          fieldName: `pageInfo`,
          fields: [`hasNextPage`, `endCursor`],
        },
        {
          fieldName: `nodes`,
          fields: fields,
        },
      ],
    })
  )

const buildVariables = variables =>
  variables && typeof variables === `string` ? `(${variables})` : ``

const buildFragment = ({ name, fields }) => `
  ... on ${name} {
    ${buildSelectionSet(fields)}
  }
`

const buildFragments = fragments =>
  fragments
    ? `
      __typename
      ${fragments.map(buildFragment).join(` `)}
    `
    : ``

export const buildSelectionSet = fields => {
  if (!fields || !fields.length) {
    return ``
  }

  return fields
    .map(field => {
      if (typeof field === `string`) {
        return field
      }

      let { fieldName, variables, fields, fragments } = field

      // @todo instead of checking for a nodes field, include the field type here
      // and check for input args instead. Maybe some kind of input args API or something would be helpful
      if (
        (!variables || variables === ``) &&
        fields?.find(field => field.fieldName === `nodes`)
      ) {
        variables = `first: 100`
      }

      const selectionSet = buildSelectionSet(fields)
      const inlineFragments = buildFragments(fragments)

      if (fieldName && (inlineFragments !== `` || selectionSet !== ``)) {
        return `
          ${fieldName} ${buildVariables(variables)} {
            ${selectionSet}
            ${inlineFragments}
          }
        `
      } else if (fieldName) {
        return fieldName
      }

      return null
    })
    .filter(Boolean).join(`
    `)
}

const buildQuery = ({
  queryName,
  fieldName,
  fieldVariables,
  variables,
  fields,
}) => `
  query ${queryName} ${buildVariables(variables)} {
    ${fieldName} ${buildVariables(fieldVariables)} {
      ${buildSelectionSet(fields)}
    }
  }
`

export const buildNodeQueryOnFieldName = ({
  fields,
  fieldName,
  variables = `$id: ID!`,
  fieldInputArguments = `id: $id`,
  queryName = `SINGLE_CONTENT_QUERY`,
}) =>
  compress(
    buildQuery({
      queryName,
      variables,
      fieldName,
      fieldVariables: fieldInputArguments,
      fields: fields,
    })
  )
