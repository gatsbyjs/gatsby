import store from "~/store"
import recursivelyTransformFields from "~/steps/ingest-remote-schema/build-queries-from-introspection/recursively-transform-fields"
import { buildSelectionSet } from "~/steps/ingest-remote-schema/build-queries-from-introspection/build-query-on-field-name"
import {
  getTypeSettingsByType,
  findTypeName,
} from "~/steps/create-schema-customization/helpers"

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

    const type = typeMap.get(findTypeName(field.type))
    const typeSettings = type ? getTypeSettingsByType(type) : {}

    if (typeSettings.exclude) {
      continue
    }

    let selectionSet

    // recursively transform fields
    const transformedFields = recursivelyTransformFields({
      fields: type.fields,
      parentType: field.type,
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
