import store from "~/store"
import recursivelyTransformFields from "~/steps/ingest-remote-schema/build-queries-from-introspection/recursively-transform-fields"
import { buildSelectionSet } from "~/steps/ingest-remote-schema/build-queries-from-introspection/build-query-on-field-name"
import { getTypeSettingsByType } from "~/steps/create-schema-customization/helpers"

const buildNonNodeQueries = async () => {
  const {
    remoteSchema: {
      typeMap,
      fieldBlacklist,
      ingestibles: { nonNodeRootFields },
    },
  } = store.getState()

  const selectionSets = []

  for (const field of nonNodeRootFields) {
    if (fieldBlacklist.includes(field.name)) {
      continue
    }

    const type =
      typeMap.get(field.type.name) || typeMap.get(field.type.ofType.name)

    const typeSettings = type ? getTypeSettingsByType(type) : {}

    if (typeSettings.exclude) {
      continue
    }

    let selectionSet

    // @todo determine and add cases for other types of
    // root fields that have no inner selection set.
    // this logic is already in query building elsewhere.
    // So perhaps use it here as well?
    const hasNoInnerSelectionSet =
      field.type &&
      field.type.kind === `LIST` &&
      field.type.ofType &&
      field.type.ofType.kind === `NON_NULL`

    const hasInnerSelectionSet = !hasNoInnerSelectionSet

    if (hasNoInnerSelectionSet) {
      selectionSet = field.name
    } else if (hasInnerSelectionSet) {
      // recursively transform fields
      const transformedFields = recursivelyTransformFields({
        fields: type.fields,
      })

      if (transformedFields) {
        const fieldSelectionSet = buildSelectionSet(transformedFields)

        selectionSet = `
        ${field.name} {
          ${fieldSelectionSet}
        }
    `
      } else {
        selectionSet = field.name
      }
    }

    if (selectionSet) {
      selectionSets.push(selectionSet)
    }
  }

  const nonNodeQuery = `
      query NON_NODE_QUERY {
        ${selectionSets.join(` `)}
      }
  `

  store.dispatch.remoteSchema.setState({ nonNodeQuery })
}

export { buildNonNodeQueries }
