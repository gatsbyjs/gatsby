import type { GatsbyNodeApiHelpers } from "~/utils/gatsby-types";
import type { IPluginOptions, IGatsbyApiState } from "./../models/gatsby-api";
import { getStore } from "~/store";

export const getPluginOptions = (): IPluginOptions => {
  return getStore().getState().gatsbyApi.pluginOptions;
};
export const getHelpers = (): GatsbyNodeApiHelpers => {
  return getStore().getState().gatsbyApi.helpers;
};
export const getGatsbyApi = (): IGatsbyApiState => {
  return getStore().getState().gatsbyApi;
};
