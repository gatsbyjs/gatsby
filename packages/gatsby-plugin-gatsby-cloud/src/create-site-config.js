import * as fs from "fs-extra"
import { SITE_CONFIG_FILENAME } from "./constants"

export default async function createSiteConfig(pluginData, _pluginOptions) {
  const { publicFolder } = pluginData
  const siteConfig = {
    pathPrefix: pluginData.pathPrefix ? pluginData.pathPrefix : null,
  }

  return fs.writeJSON(publicFolder(SITE_CONFIG_FILENAME), siteConfig)
}
