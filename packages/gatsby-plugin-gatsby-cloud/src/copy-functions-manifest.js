import { copyFile } from "fs-extra"
import {
  PUBLIC_FUNCTIONS_FILENAME,
  CACHE_FUNCTIONS_FILENAME,
} from "./constants"

export default async function copyFunctionsManifest(pluginData, siteDirectory) {
  const { publicFolder, functionsFolder } = pluginData
  const manifestPath = functionsFolder(CACHE_FUNCTIONS_FILENAME)
  const publicManifestPath = publicFolder(PUBLIC_FUNCTIONS_FILENAME)

  await copyFile(manifestPath, publicManifestPath)
}
