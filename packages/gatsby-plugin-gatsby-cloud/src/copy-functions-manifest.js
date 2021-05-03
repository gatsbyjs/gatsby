import { copyFile, existsSync } from "fs-extra"
import {
  PUBLIC_FUNCTIONS_FILENAME,
  CACHE_FUNCTIONS_FILENAME,
} from "./constants"

export default async function copyFunctionsManifest(pluginData) {
  const { publicFolder, functionsFolder } = pluginData
  const manifestPath = functionsFolder(CACHE_FUNCTIONS_FILENAME)
  const publicManifestPath = publicFolder(PUBLIC_FUNCTIONS_FILENAME)

  const hasManifestFile = existsSync(manifestPath)

  if (hasManifestFile) {
    await copyFile(manifestPath, publicManifestPath)
  }
}
