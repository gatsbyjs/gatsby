import remoteSchema from "./remoteSchema";
import gatsbyApi from "./gatsby-api";
import logger from "./logger";
import imageNodes from "./image-nodes";
import wpHooks from "./wp-hooks";
import previewStore from "./preview";
import develop from "./develop";
import postBuildWarningCounts from "./post-build-warning-logs";
import { type Models, createModel } from "@rematch/core";

export const settings = createModel<IRootModel>()({
  state: 0,
  reducers: {
    increment: (state, payload: number) => state + payload,
  },
  effects: () => {
    return {};
  },
});

export type IRootModel = {
  remoteSchema: typeof remoteSchema;
  gatsbyApi: typeof gatsbyApi;
  logger: typeof logger;
  imageNodes: typeof imageNodes;
  wpHooks: typeof wpHooks;
  previewStore: typeof previewStore;
  develop: typeof develop;
  postBuildWarningCounts: typeof postBuildWarningCounts;
} & Models<IRootModel>;

const models: IRootModel = {
  remoteSchema,
  gatsbyApi,
  logger,
  imageNodes,
  wpHooks,
  previewStore,
  develop,
  postBuildWarningCounts,
};

export default models;
