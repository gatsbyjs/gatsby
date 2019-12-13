export const buildNodesQueryOnFieldName = ({ fields, fieldName }) =>
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
        innerFields: fields,
      },
    ],
  })

const buildVariables = variables =>
  variables && typeof variables === `string` ? `(${variables})` : ``

const buildFragment = ({ name, fields }) => `
  ... on ${name} {
    ${buildSelectionSet(fields)}
  }
`

const buildFragments = fragments => fragments.map(buildFragment).join(` `)

const buildSelectionSet = fields =>
  fields
    .map(field => {
      if (typeof field === `string`) {
        return field
      }

      const { fieldName, variables, innerFields, innerFragments } = field

      if (fieldName && innerFragments) {
        return `
          ${fieldName} {
            ${buildFragments(innerFragments)}
          }
        `
      }

      if (fieldName && innerFields) {
        return `
            ${fieldName} ${buildVariables(variables)} {
              ${buildSelectionSet(innerFields)}
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
      ${buildSelectionSet(fields)}
    }
  }
`

export const buildNodeQueryOnFieldName = ({ fields, fieldName }) =>
  buildQuery({
    queryName: `SINGLE_CONTENT_QUERY`,
    variables: `$id: ID!`,
    fieldName,
    fieldVariables: `id: $id`,
    fields: fields,
  })
