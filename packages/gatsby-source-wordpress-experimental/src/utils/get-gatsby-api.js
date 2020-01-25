import store from "~/store"

export const getPluginOptions = () => store.getState().gatsbyApi.pluginOptions
export const getHelpers = () => store.getState().gatsbyApi.helpers
export const getGatsbyApi = () => store.getState().gatsbyApi
