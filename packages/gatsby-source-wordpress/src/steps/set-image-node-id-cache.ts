import { getStore } from "~/store"
import { setPersistentCache } from "~/utils/cache"

// since we create image nodes in resolvers
// we cache our image node id's on post build for production
// and on create dev server for development
// so we can touch our image nodes in both develop and build
// so they don't get garbage collected by Gatsby
const setImageNodeIdCache = async (): Promise<void> => {
  const state = getStore().getState()
  const { imageNodes } = state

  if (imageNodes.nodeMetaByUrl) {
    await setPersistentCache({
      key: `image-node-meta-by-url`,
      value: imageNodes.nodeMetaByUrl,
    })
  }
}

export { setImageNodeIdCache }
