import store from "../../store"
import fetchGraphql from "../../utils/fetch-graphql"

export default async function fetchReferencedMediaItemsAndCreateNodes({
  referencedMediaItemNodeIds,
}) {
  const state = store.getState()
  const { selectionSet } = state.introspection.queries.mediaItems
  const { pluginOptions, helpers } = state.gatsbyApi
  const { createContentDigest, actions } = helpers

  // fetch MediaItem nodes that are referenced in existing nodes by id.
  const query = `
      fragment GatsbyMediaItemFields on MediaItem {
          ${selectionSet}
        }

      query {
        ${referencedMediaItemNodeIds
          .map(
            (id, index) => `
          idIndex${index}: mediaItemBy(id: "${id}") {
            ...GatsbyMediaItemFields
          }
        `
          )
          .join(` `)}
      }
    `

  const { data } = await fetchGraphql({
    url: pluginOptions.url,
    query,
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
