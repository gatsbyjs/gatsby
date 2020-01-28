import compress from "graphql-query-compress"

export const buildNodesQueryOnFieldName = ({
  fields,
  fieldName,
  postTypes,
  queryVariables = ``,
  fieldVariables = ``,
}) =>
  compress(
    buildQuery({
      queryName: `NODE_LIST_QUERY`,
      variables: `$first: Int!, $after: String, ${queryVariables}`,
      fieldName,
      fieldVariables: `first: $first, after: $after ${
        // this is temporary until we can get a flat list of posts
        // https://github.com/wp-graphql/wp-graphql/issues/928
        postTypes &&
        postTypes.length &&
        postTypes
          .map(postType => postType.fieldNames.plural)
          .includes(fieldName)
          ? `, where: { parent: null }`
          : ``
      }, ${fieldVariables}`,
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

const buildFragments = fragments => `
  __typename
  ${fragments.map(buildFragment).join(` `)}
`

export const buildSelectionSet = fields => {
  if (!fields || !fields.length) {
    return ``
  }

  return fields
    .map(field => {
      if (typeof field === `string`) {
        return field
      }

      const { fieldName, variables, fields, fragments } = field

      if (fieldName && fragments) {
        return `
          ${fieldName} {
            ${buildFragments(fragments)}
          }
        `
      }

      if (fieldName && fields) {
        return `
            ${fieldName} ${buildVariables(variables)} {
              ${buildSelectionSet(fields)}
            }
          `
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

export const buildNodeQueryOnFieldName = ({ fields, fieldName }) =>
  compress(
    buildQuery({
      queryName: `SINGLE_CONTENT_QUERY`,
      variables: `$id: ID!`,
      fieldName,
      fieldVariables: `id: $id`,
      fields: fields,
    })
  )
