import * as fs from "fs-extra"
import { SITE_CONFIG_FILENAME } from "./constants"

/*
 *  @deprecated TODO(v5): Will be Remove in V5 since we're now sending config over IPC
 *  see https://github.com/gatsbyjs/gatsby/pull/34411
 */
export default async function createSiteConfig(pluginData, _pluginOptions) {
  const { publicFolder } = pluginData
  const siteConfig = {
    pathPrefix: pluginData.pathPrefix ? pluginData.pathPrefix : null,
  }

  return fs.writeJSON(publicFolder(SITE_CONFIG_FILENAME), siteConfig)
}
