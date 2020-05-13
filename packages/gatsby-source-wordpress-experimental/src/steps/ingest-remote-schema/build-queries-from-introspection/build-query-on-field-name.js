import compress from "graphql-query-compress"
import store from "~/store"
import { findTypeName } from "~/steps/create-schema-customization/helpers"

export const buildReusableFragments = ({ fragments }) =>
  Object.values(fragments)
    .map(
      ({
        name,
        type,
        fields,
        inlineFragments,
      }) => `fragment ${name} on ${type} {
      ${buildSelectionSet(fields)}
      ${buildInlineFragments(inlineFragments)}
    }`
    )
    .join(` `)

export const buildNodesQueryOnFieldName = ({
  fieldName,
  builtSelectionSet,
  builtFragments = ``,
  queryVariables = ``,
  fieldVariables = ``,
}) =>
  compress(
    buildQuery({
      queryName: `NODE_LIST_QUERY`,
      variables: `$first: Int!, $after: String, ${queryVariables}`,
      fieldName,
      fieldVariables: `first: $first, after: $after, ${fieldVariables}`,
      builtSelectionSet: `
        nodes {
          ${builtSelectionSet}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      `,
      builtFragments,
    })
  )

const buildVariables = variables =>
  variables && typeof variables === `string` ? `(${variables})` : ``

const buildInlineFragment = ({ name, fields, fragments }) => `
  ... on ${name} {
    ${buildSelectionSet(fields, { fragments })}
  }
`

const buildInlineFragments = (inlineFragments, { fragments = {} } = {}) =>
  inlineFragments
    ? `
      __typename
      ${inlineFragments
        .map(inlineFragment =>
          buildInlineFragment({ ...inlineFragment, fragments })
        )
        .join(` `)}
    `
    : ``

export const buildSelectionSet = (fields, { fragments = {} } = {}) => {
  if (!fields || !fields.length) {
    return ``
  }

  const {
    remoteSchema: { typeMap },
  } = store.getState()

  const selectionSet = fields
    .map(field => {
      if (typeof field === `string`) {
        return field
      }

      let {
        fieldName,
        variables,
        fields,
        inlineFragments,
        fieldType,
        internalType,
        builtSelectionSet,
      } = field

      if (internalType === `Fragment`) {
        return `...${field.fragment.name}`
      }

      if (
        (!variables || variables === ``) &&
        fields?.find(field => field.fieldName === `nodes`)
      ) {
        // @todo instead of checking for a nodes field, include the field type here
        // and check for input args instead. Maybe some kind of input args API or something would be helpful
        variables = `first: 100`
      }

      const selectionSet =
        builtSelectionSet ||
        buildSelectionSet(fields, {
          fragments,
        })

      const builtInlineFragments = buildInlineFragments(inlineFragments, {
        fragments,
      })

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

  return selectionSet
}

const buildQuery = ({
  queryName,
  fieldName,
  fieldVariables,
  variables,
  builtSelectionSet,
  builtFragments = ``,
}) => `
  query ${queryName} ${buildVariables(variables)} {
    ${fieldName} ${buildVariables(fieldVariables)} {
      ${builtSelectionSet}
    }
  }

  ${builtFragments}
`

export const buildNodeQueryOnFieldName = ({
  fieldName,
  builtFragments,
  builtSelectionSet,
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
      builtFragments,
      builtSelectionSet,
    })
  )
