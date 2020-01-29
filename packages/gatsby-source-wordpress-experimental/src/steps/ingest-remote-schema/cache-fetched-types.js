import store from "~/store"
export const cacheFetchedTypes = async () => {
  const state = store.getState()
  const { fetchedTypes } = state.remoteSchema
  const { helpers } = state.gatsbyApi

  await helpers.cache.set(
    `previously-fetched-types`,
    Array.from([...fetchedTypes])
  )
}
