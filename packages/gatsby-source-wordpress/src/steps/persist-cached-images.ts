import { Step } from "./../utils/run-steps"
import { getStore } from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { getPersistentCache } from "~/utils/cache"
import { needToTouchNodes } from "~/utils/gatsby-features"

const persistPreviouslyCachedImages: Step = async (): Promise<void> => {
  const { helpers, pluginOptions } = getGatsbyApi()

  // get all existing media item nodes
  const mediaItemNodes = helpers.getNodesByType(
    `${pluginOptions.schema.typePrefix}MediaItem`
  )

  if (needToTouchNodes) {
    // and if needed touch them so they aren't garbage collected.
    // we will remove them as needed when receiving DELETE events from WP
    mediaItemNodes.forEach(node => helpers.actions.touchNode(node))
  }

  const imageNodeMetaByUrl = await getPersistentCache({
    key: `image-node-meta-by-url`,
  })

  if (imageNodeMetaByUrl) {
    getStore().dispatch.imageNodes.setState({
      nodeMetaByUrl: imageNodeMetaByUrl,
    })
  }
}

export { persistPreviouslyCachedImages }
