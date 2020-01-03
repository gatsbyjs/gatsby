import chunk from "lodash/chunk"
import store from "../../store"
import atob from "atob"
import { fetchWPGQLContentNodes } from "./fetch-nodes"
import { createRemoteMediaItemNode } from "./create-remote-media-item-node"

export default async function fetchReferencedMediaItemsAndCreateNodes({
  referencedMediaItemNodeIds,
}) {
  const state = store.getState()
  const queryInfo = state.introspection.queries.mediaItems

  const { helpers } = state.gatsbyApi
  const { createContentDigest, actions } = helpers

  let allMediaItemNodes = []

  const nodesPerFetch = 10
  const chunkedIds = chunk(referencedMediaItemNodeIds, nodesPerFetch)

  for (const relayIds of chunkedIds) {
    // relay id's are base64 encoded from strings like attachment:89381
    // where 89381 is the id we want for our query
    // so we split on the : and get the last item in the array, which is the id
    // once we can get a list of media items by relay id's, we can remove atob
    const ids = relayIds.map(
      id =>
        atob(id)
          .split(`:`)
          .slice(-1)[0]
    )

    const query = `
    query MEDIA_ITEMS($in: [ID]) {
      mediaItems(first: ${nodesPerFetch}, where:{ in: $in }) {
        nodes {
          ${queryInfo.selectionSet}
        }
      }
    }
    `

    const { allNodesOfContentType } = await fetchWPGQLContentNodes({
      queryInfo: {
        ...queryInfo,
        listQueryString: query,
      },
      variables: {
        in: ids,
      },
    })

    allMediaItemNodes = [...allMediaItemNodes, ...allNodesOfContentType]
  }

  if (!allMediaItemNodes || !allMediaItemNodes.length) {
    return
  }

  await Promise.all(
    allMediaItemNodes.map(async node => {
      const remoteFile = await createRemoteMediaItemNode({
        mediaItemNode: node,
        helpers,
      })

      await actions.createNode({
        ...node,
        remoteFile: {
          id: remoteFile.id,
        },
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          type: `WpMediaItem`,
        },
      })
    })
  )
}
