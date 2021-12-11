import { Models } from "@rematch/core"

import remoteSchema from "./remoteSchema"
import gatsbyApi from "./gatsby-api"
import logger from "./logger"
import imageNodes from "./image-nodes"
import wpHooks from "./wp-hooks"
import previewStore from "./preview"
import develop from "./develop"
import postBuildWarningCounts from "./post-build-warning-logs"

export const models = {
  remoteSchema,
  gatsbyApi,
  logger,
  imageNodes,
  wpHooks,
  previewStore,
  develop,
  postBuildWarningCounts,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface RootModel extends Models<RootModel> {
  remoteSchema: typeof remoteSchema
  gatsbyApi: typeof gatsbyApi
  logger: typeof logger
  imageNodes: typeof imageNodes
  wpHooks: typeof wpHooks
  previewStore: typeof previewStore
  develop: typeof develop
  postBuildWarningCounts: typeof postBuildWarningCounts
}
