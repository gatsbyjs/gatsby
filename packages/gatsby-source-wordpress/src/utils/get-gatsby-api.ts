import { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
import { IPluginOptions, IGatsbyApiState } from "./../models/gatsby-api"
import store from "~/store"

export const getPluginOptions = (): IPluginOptions =>
  store.getState().gatsbyApi.pluginOptions
export const getHelpers = (): GatsbyNodeApiHelpers =>
  store.getState().gatsbyApi.helpers
export const getGatsbyApi = (): IGatsbyApiState => store.getState().gatsbyApi
