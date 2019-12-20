import chunk from "lodash/chunk"
import store from "../../store"
import fetchGraphql from "../../utils/fetch-graphql"

export default async function fetchReferencedMediaItemsAndCreateNodes({
  referencedMediaItemNodeIds,
}) {
  const state = store.getState()
  const { selectionSet } = state.introspection.queries.mediaItems
  const { pluginOptions, helpers } = state.gatsbyApi
  const { createContentDigest, actions } = helpers

  const chunkedIds = chunk(referencedMediaItemNodeIds, 100)

  for (const ids of chunkedIds) {
    const query = `
    query MEDIA_ITEMS($in: [ID]) {
      mediaItems(where:{ in: $in }) {
        nodes {
          ${selectionSet}
        }
      }
    }
    `

    const { data } = await fetchGraphql({
      url: pluginOptions.url,
      query,
      variables: {
        ids,
      },
      panicOnError: true,
    })

    for (const node of Object.values(data)) {
      await actions.createNode({
        ...node,
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          // @todo allow namespacing types with a plugin option. Default to `Wp`
          type: `WpMediaItem`,
        },
      })
    }
  }
}
