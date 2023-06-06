import { getStore } from "~/store"
import { setPersistentCache } from "~/utils/cache"
export const cacheFetchedTypes = async () => {
  const state = getStore().getState()
  const { fetchedTypes } = state.remoteSchema

  await setPersistentCache({
    key: `previously-fetched-types`,
    value: Array.from([...fetchedTypes]),
  })
}
