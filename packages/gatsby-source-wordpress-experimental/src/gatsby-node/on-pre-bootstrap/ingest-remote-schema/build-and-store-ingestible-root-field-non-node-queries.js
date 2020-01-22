import store from "../../../store"
import recursivelyTransformFields from "../build-queries-from-introspection/recursively-transform-fields"
import { buildSelectionSet } from "../build-queries-from-introspection/build-query-on-field-name"
import { getTypeSettingsByType } from "../../create-schema-customization/helpers"

const buildAndStoreIngestibleRootFieldNonNodeQueries = async () => {
  const {
    introspection: {
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

    const typeSettings = getTypeSettingsByType(type)

    if (typeSettings.exclude) {
      continue
    }

    // recursively transform fields
    const transformedFields = recursivelyTransformFields({
      fields: type.fields,
    })

    let selectionSet

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

    selectionSets.push(selectionSet)
  }

  const nonNodeQuery = `
      query NON_NODE_QUERY {
        ${selectionSets.join(` `)}
      }
  `

  store.dispatch.introspection.setState({ nonNodeQuery })
}

export default buildAndStoreIngestibleRootFieldNonNodeQueries
