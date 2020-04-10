import store from "~/store"

// since we create image nodes in resolvers
// we cache our image node id's on post build for production
// and on create dev server for development
// so we can touch our image nodes in both develop and build
// so they don't get garbage collected by Gatsby
const setImageNodeIdCache = async () => {
  const state = await store.getState()
  const { imageNodes, gatsbyApi } = state

  if (imageNodes.nodeIds && imageNodes.nodeIds.length) {
    await gatsbyApi.helpers.cache.set(`image-node-ids`, imageNodes.nodeIds)
  }

  if (imageNodes.nodeMetaByUrl) {
    await gatsbyApi.helpers.cache.set(
      `image-node-meta-by-url`,
      imageNodes.nodeMetaByUrl
    )
  }
}

export { setImageNodeIdCache }
