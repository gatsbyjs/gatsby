import { Step } from "./../utils/run-steps"
import store from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { getPersistentCache } from "~/utils/cache"

const persistPreviouslyCachedImages: Step = async (): Promise<void> => {
  const { helpers, pluginOptions } = getGatsbyApi()

  // get all existing media item nodes
  const mediaItemNodes = helpers.getNodesByType(
    `${pluginOptions.schema.typePrefix}MediaItem`
  )

  // and touch them so they aren't garbage collected.
  // we will remove them as needed when receiving DELETE events from WP
  mediaItemNodes.forEach(({ id }) =>
    helpers.actions.touchNode(helpers.getNode(id))
  )

  const imageNodeMetaByUrl = await getPersistentCache({
    key: `image-node-meta-by-url`,
  })

  if (imageNodeMetaByUrl) {
    store.dispatch.imageNodes.setState({
      nodeMetaByUrl: imageNodeMetaByUrl,
    })
  }
}

export { persistPreviouslyCachedImages }
