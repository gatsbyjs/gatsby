import { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
import { IPluginOptions, IGatsbyApiState } from "./../models/gatsby-api"
import { getStore } from "~/store"

export const getPluginOptions = (): IPluginOptions =>
  getStore().getState().gatsbyApi.pluginOptions
export const getHelpers = (): GatsbyNodeApiHelpers =>
  getStore().getState().gatsbyApi.helpers
export const getGatsbyApi = (): IGatsbyApiState =>
  getStore().getState().gatsbyApi
