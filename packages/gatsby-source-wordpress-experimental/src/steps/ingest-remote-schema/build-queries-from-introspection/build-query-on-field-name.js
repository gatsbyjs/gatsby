import compress from "graphql-query-compress"
import store from "~/store"
import { findTypeName } from "~/steps/create-schema-customization/helpers"

export const buildNodesQueryOnFieldName = ({
  fields,
  fieldName,
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

const buildFragments = inlineFragments =>
  inlineFragments
    ? `
      __typename
      ${inlineFragments.map(buildFragment).join(` `)}
    `
    : ``

export const buildSelectionSet = fields => {
  if (!fields || !fields.length) {
    return ``
  }

  const {
    remoteSchema: { typeMap },
  } = store.getState()

  return fields
    .map(field => {
      if (typeof field === `string`) {
        return field
      }

      let { fieldName, variables, fields, inlineFragments, fieldType } = field

      // @todo instead of checking for a nodes field, include the field type here
      // and check for input args instead. Maybe some kind of input args API or something would be helpful
      if (
        (!variables || variables === ``) &&
        fields?.find(field => field.fieldName === `nodes`)
      ) {
        variables = `first: 100`
      }

      const selectionSet = buildSelectionSet(fields)
      const builtInlineFragments = buildFragments(inlineFragments)

      if (fieldName && (builtInlineFragments !== `` || selectionSet !== ``)) {
        return `
          ${fieldName} ${buildVariables(variables)} {
            ${selectionSet}
            ${builtInlineFragments}
          }
        `
      } else if (fieldName) {
        const fullFieldType = typeMap.get(findTypeName(fieldType))

        // if this field has subfields but we didn't build a selection set for it
        // we shouldn't fetch this field. This can happen when we have self referencing types that are limited by the schema.circularQueryLimit plugin option.
        // @todo the above should be fixed in recursively-transform-fields.js instead of here. recursion is hard :p
        if (fullFieldType.fields) {
          return null
        }

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
