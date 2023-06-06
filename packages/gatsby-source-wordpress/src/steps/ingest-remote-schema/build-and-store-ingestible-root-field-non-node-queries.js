import { getStore } from "~/store"
import recursivelyTransformFields from "~/steps/ingest-remote-schema/build-queries-from-introspection/recursively-transform-fields"
import { buildSelectionSet } from "~/steps/ingest-remote-schema/build-queries-from-introspection/build-query-on-field-name"
import { generateReusableFragments } from "./build-queries-from-introspection/build-query-on-field-name"

const buildNonNodeQueries = async () => {
  const {
    remoteSchema: {
      ingestibles: { nonNodeRootFields },
    },
  } = getStore().getState()

  const fragments = {}

  // recursively transform fields
  const transformedFields = recursivelyTransformFields({
    fields: nonNodeRootFields,
    parentType: {
      name: `RootQuery`,
      type: `OBJECT`,
    },
    fragments,
  })

  const selectionSet = buildSelectionSet(transformedFields)

  const builtFragments = generateReusableFragments({
    fragments,
    selectionSet,
  })

  const nonNodeQuery = `
      query NON_NODE_QUERY {
        ${selectionSet}
      }
      ${builtFragments}
  `

  getStore().dispatch.remoteSchema.setState({ nonNodeQuery })
}

export { buildNonNodeQueries }
