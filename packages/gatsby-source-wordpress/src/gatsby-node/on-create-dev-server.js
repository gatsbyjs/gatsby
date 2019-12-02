import startIntervalRefetcher from "./source-nodes/interval-refetcher"
import setImageNodeIdCache from "./set-image-node-id-cache"

export default async (helpers, pluginOptions) => {
  await setImageNodeIdCache()
  startIntervalRefetcher({}, helpers, pluginOptions)
}
